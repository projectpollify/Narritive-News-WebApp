import { ArweaveService } from '../lib/blockchain/arweave';

async function testUpload() {
    console.log("🧪 Testing Arweave Service...");

    const mockArticle = {
        id: 'test-123',
        title: 'Test Article for Amber',
        aiAnalysis: { summary: 'This is a test summary.' },
        leftSource: { outlet: 'Left Outlet' },
        rightSource: { outlet: 'Right Outlet' },
        publishedAt: new Date().toISOString(),
        category: 'Test'
    };

    try {
        const txId = await ArweaveService.uploadArticle(mockArticle);
        console.log(`✅ Test Passed! Returned TXID: ${txId}`);

        if (txId.startsWith('mock_')) {
            console.log("ℹ️ Correctly used Mock Mode (no private key found).");
        } else {
            console.log("⚠️ Warning: Used real upload (unexpected without key).");
        }
    } catch (error) {
        console.error("❌ Test Failed:", error);
    }
}

testUpload();
