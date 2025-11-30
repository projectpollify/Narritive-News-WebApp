import { Uploader } from "@irys/upload";
import { Ethereum } from "@irys/upload-ethereum";

// Interface for the article data structure to be stored
interface ArticleData {
    id: string;
    title: string;
    summary: string;
    content: string; // Combined or main content
    aiAnalysis: any;
    leftSource: any;
    rightSource: any;
    publishedAt: string;
    category: string;
    personaId?: string;
    upvotes?: number;
    downvotes?: number;
    timestamp: string;
}

export class ArweaveService {
    private static async getIrysUploader() {
        const privateKey = process.env.ARWEAVE_PRIVATE_KEY; // Ethereum private key

        if (!privateKey) {
            console.warn("⚠️ No ARWEAVE_PRIVATE_KEY found. Using mock mode.");
            return null;
        }

        try {
            // Connect to Irys Node (using Polygon for payment as it's cheap/fast)
            // We use the 'ethereum' driver but pay with MATIC on Polygon
            const uploader = await Uploader(Ethereum)
                .withWallet(privateKey)
                .mainnet() // Use mainnet for permanent storage
                .build();

            return uploader;
        } catch (error) {
            console.error("❌ Failed to initialize Irys uploader:", error);
            return null;
        }
    }

    /**
     * Uploads an article to Arweave via Irys
     * @param article The article object to upload
     * @returns The Transaction ID (TXID)
     */
    static async uploadArticle(article: any): Promise<string> {
        const uploader = await this.getIrysUploader();

        // Prepare the data payload
        const payload: ArticleData = {
            id: article.id,
            title: article.title,
            summary: article.aiAnalysis?.summary || article.aiAnalysis,
            content: `Left Source: ${article.leftSource.outlet}\nRight Source: ${article.rightSource.outlet}`,
            aiAnalysis: article.aiAnalysis,
            leftSource: article.leftSource,
            rightSource: article.rightSource,
            publishedAt: article.publishedAt,
            category: article.category,
            personaId: article.personaId,
            upvotes: article.upvotes || 0,
            downvotes: article.downvotes || 0,
            timestamp: new Date().toISOString()
        };

        const dataToUpload = JSON.stringify(payload, null, 2);

        // Mock Mode (if no key or dev environment)
        if (!uploader) {
            console.log("🔒 [MOCK] Uploading to Arweave (Preserved in Amber)...");
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
            const mockTxId = "mock_arweave_tx_" + Math.random().toString(36).substring(7);
            console.log(`✅ [MOCK] Upload successful! TXID: ${mockTxId}`);
            return mockTxId;
        }

        try {
            console.log("🔒 Uploading to Arweave via Irys...");

            // Calculate price (optional, for logging)
            // const price = await irys.getPrice(dataToUpload.length);
            // console.log(`   Size: ${dataToUpload.length} bytes, Cost: ${irys.utils.fromAtomic(price)} tokens`);

            // Upload
            const receipt = await uploader.upload(dataToUpload, {
                tags: [
                    { name: "App-Name", value: "NarrativeNews" },
                    { name: "Content-Type", value: "application/json" },
                    { name: "Version", value: "1.0.0" },
                    { name: "Article-ID", value: article.id },
                    { name: "Type", value: "News-Analysis" }
                ]
            });

            console.log(`✅ Upload successful! TXID: ${receipt.id}`);
            return receipt.id;

        } catch (error) {
            console.error("❌ Arweave upload failed:", error);
            // Fallback to mock ID in case of failure to not block the user flow
            return "failed_upload_" + Date.now();
        }
    }

    /**
     * Get the public gateway URL for a transaction
     */
    static getGatewayUrl(txId: string): string {
        return `https://gateway.irys.xyz/${txId}`;
    }
}
