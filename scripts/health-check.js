#!/usr/bin/env node

/**
 * Health Check Script for Narrative News
 * Verifies all critical systems are operational
 * Run with: npm run health-check
 */

const https = require('https');
const http = require('http');

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const TIMEOUT = 10000; // 10 seconds

class HealthChecker {
  constructor() {
    this.results = {
      overall: 'unknown',
      checks: [],
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };
  }

  async runAllChecks() {
    console.log('🏥 Running health checks for Narrative News...\n');
    
    const checks = [
      this.checkHomepage(),
      this.checkAPIHealth(),
      this.checkDatabase(),
      this.checkAutomation(),
      this.checkEmailService(),
      this.checkAIService()
    ];

    try {
      await Promise.all(checks);
      this.calculateOverallHealth();
      this.printResults();
      
      // Exit with appropriate code
      const hasFailures = this.results.checks.some(check => check.status === 'fail');
      process.exit(hasFailures ? 1 : 0);
      
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      process.exit(1);
    }
  }

  async checkHomepage() {
    return this.httpCheck({
      name: 'Homepage',
      description: 'Main website accessibility',
      url: SITE_URL,
      expectedStatus: 200
    });
  }

  async checkAPIHealth() {
    return this.httpCheck({
      name: 'API Health',
      description: 'API endpoints responding',
      url: `${SITE_URL}/api/articles`,
      expectedStatus: 200
    });
  }

  async checkDatabase() {
    return this.httpCheck({
      name: 'Database',
      description: 'Database connectivity',
      url: `${SITE_URL}/api/admin/stats`,
      expectedStatus: 200
    });
  }

  async checkAutomation() {
    return this.httpCheck({
      name: 'Automation System',
      description: 'Automation service status',
      url: `${SITE_URL}/api/automation`,
      expectedStatus: 200
    });
  }

  async checkEmailService() {
    return this.httpCheck({
      name: 'Email Service',
      description: 'Email configuration',
      url: `${SITE_URL}/api/email/health`,
      expectedStatus: 200
    });
  }

  async checkAIService() {
    return this.httpCheck({
      name: 'AI Service',
      description: 'OpenAI API connectivity',
      url: `${SITE_URL}/api/ai-analysis/health`,
      expectedStatus: 200
    });
  }

  async httpCheck({ name, description, url, expectedStatus = 200 }) {
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest(url);
      const responseTime = Date.now() - startTime;
      
      const success = response.statusCode === expectedStatus;
      
      this.results.checks.push({
        name,
        description,
        status: success ? 'pass' : 'fail',
        responseTime: `${responseTime}ms`,
        statusCode: response.statusCode,
        error: success ? null : `Expected ${expectedStatus}, got ${response.statusCode}`
      });

      console.log(`${success ? '✅' : '❌'} ${name}: ${success ? 'PASS' : 'FAIL'} (${responseTime}ms)`);
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.results.checks.push({
        name,
        description,
        status: 'fail',
        responseTime: `${responseTime}ms`,
        statusCode: null,
        error: error.message
      });

      console.log(`❌ ${name}: FAIL (${responseTime}ms) - ${error.message}`);
    }
  }

  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      
      const request = client.get(url, {
        timeout: TIMEOUT,
        headers: {
          'User-Agent': 'Narrative-News-Health-Check/1.0'
        }
      }, (response) => {
        // Consume response data to free up memory
        response.on('data', () => {});
        response.on('end', () => {
          resolve(response);
        });
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error(`Request timeout after ${TIMEOUT}ms`));
      });

      request.on('error', (error) => {
        reject(error);
      });
    });
  }

  calculateOverallHealth() {
    const totalChecks = this.results.checks.length;
    const passedChecks = this.results.checks.filter(check => check.status === 'pass').length;
    const failedChecks = totalChecks - passedChecks;

    if (failedChecks === 0) {
      this.results.overall = 'healthy';
    } else if (failedChecks <= 1) {
      this.results.overall = 'degraded';
    } else {
      this.results.overall = 'unhealthy';
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 HEALTH CHECK RESULTS');
    console.log('='.repeat(50));
    
    const totalChecks = this.results.checks.length;
    const passedChecks = this.results.checks.filter(check => check.status === 'pass').length;
    const failedChecks = totalChecks - passedChecks;
    
    console.log(`Overall Status: ${this.getStatusIcon(this.results.overall)} ${this.results.overall.toUpperCase()}`);
    console.log(`Environment: ${this.results.environment}`);
    console.log(`Timestamp: ${this.results.timestamp}`);
    console.log(`Checks: ${passedChecks}/${totalChecks} passed`);
    
    if (failedChecks > 0) {
      console.log('\n❌ FAILED CHECKS:');
      this.results.checks
        .filter(check => check.status === 'fail')
        .forEach(check => {
          console.log(`  - ${check.name}: ${check.error}`);
        });
    }

    console.log('\n📈 PERFORMANCE:');
    this.results.checks.forEach(check => {
      console.log(`  - ${check.name}: ${check.responseTime}`);
    });

    if (this.results.overall === 'healthy') {
      console.log('\n🎉 All systems operational!');
    } else if (this.results.overall === 'degraded') {
      console.log('\n⚠️  Some systems are experiencing issues');
    } else {
      console.log('\n🚨 Critical systems are down - immediate attention required!');
    }
    
    console.log('='.repeat(50));
  }

  getStatusIcon(status) {
    switch (status) {
      case 'healthy': return '🟢';
      case 'degraded': return '🟡';
      case 'unhealthy': return '🔴';
      default: return '⚪';
    }
  }
}

// Command line interface
if (require.main === module) {
  const checker = new HealthChecker();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Health check interrupted');
    process.exit(1);
  });

  // Run health checks
  checker.runAllChecks().catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = HealthChecker;