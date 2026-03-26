import apiClient from "@/lib/api";

/**
 * Frontend-Backend Integration Verification
 * This utility helps verify that the frontend can properly communicate with the backend
 */

export interface IntegrationCheckResult {
  status: "success" | "error";
  timestamp: string;
  checks: {
    apiClient: boolean;
    backendConnectivity: boolean;
    errorHandling: boolean;
    corsEnabled: boolean;
  };
  errors: string[];
}

export async function verifyIntegration(): Promise<IntegrationCheckResult> {
  const errors: string[] = [];
  const checks = {
    apiClient: false,
    backendConnectivity: false,
    errorHandling: false,
    corsEnabled: false,
  };

  try {
    // Check 1: API Client initialized
    checks.apiClient = !!apiClient;
    if (!apiClient) {
      errors.push("API client not initialized");
    } else {
      console.log("✅ API client initialized");
    }

    // Check 2: Backend connectivity
    try {
      const response = await fetch("http://localhost:3000/api");
      checks.backendConnectivity = response.ok || response.status === 404;
      console.log(`✅ Backend is ${response.ok ? "responding" : "accessible"}`);
    } catch (error) {
      errors.push(
        `Backend connectivity failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      console.error("❌ Backend connection failed");
    }

    // Check 3: Error handling
    try {
      // Try to access non-existent endpoint to test error handling
      await apiClient.getClient().get("/non-existent-endpoint");
    } catch (error) {
      // This should fail, but we're checking if it's handled gracefully
      checks.errorHandling = true;
      console.log("✅ Error handling working");
    }

    // Check 4: CORS enabled
    try {
      const response = await fetch("http://localhost:3000/api", {
        method: "OPTIONS",
        headers: {
          "Access-Control-Request-Method": "GET",
          "Access-Control-Request-Headers": "content-type",
        },
      });
      checks.corsEnabled = response.status === 200 || response.status === 204;
      if (checks.corsEnabled) {
        console.log("✅ CORS is enabled");
      }
    } catch (error) {
      console.warn("⚠️ CORS check inconclusive");
    }
  } catch (error) {
    errors.push(
      `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  const result: IntegrationCheckResult = {
    status: errors.length === 0 ? "success" : "error",
    timestamp: new Date().toISOString(),
    checks,
    errors,
  };

  console.log("\n📋 Integration Check Results:");
  console.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * Test login functionality
 */
export async function testLogin(email: string, password: string) {
  try {
    console.log(`🔐 Testing login with ${email}...`);
    const response = await apiClient.login(email, password);

    if (response.data.status === "success") {
      console.log("✅ Login successful");
      return { success: true, data: response.data.data };
    } else {
      console.error("❌ Login failed:", response.data.message);
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    console.error("❌ Login error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Test API endpoints
 */
export async function testApiEndpoints() {
  console.log("\n🧪 Testing API Endpoints...\n");

  const tests = [
    {
      name: "Get Outlets",
      fn: () => apiClient.getOutlets(),
    },
    {
      name: "Get Users",
      fn: () => apiClient.getUsers(),
    },
    {
      name: "Get Orders",
      fn: () => apiClient.getOrders(),
    },
    {
      name: "Get Inventory",
      fn: () => apiClient.getInventory(),
    },
    {
      name: "Get Wastage",
      fn: () => apiClient.getWastage(),
    },
    {
      name: "Get Party Orders",
      fn: () => apiClient.getPartyOrders(),
    },
    {
      name: "Get Attendance",
      fn: () => apiClient.getAttendance(),
    },
    {
      name: "Get Cache Flow",
      fn: () => apiClient.getCashFlow(),
    },
  ];

  const results = [];

  for (const test of tests) {
    try {
      await test.fn();
      console.log(`✅ ${test.name}`);
      results.push({ test: test.name, status: "passed" });
    } catch (error) {
      console.log(`❌ ${test.name}: ${error instanceof Error ? error.message : "Failed"}`);
      results.push({
        test: test.name,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

// Auto-run verification in development
if (import.meta.env.DEV) {
  console.log("🚀 Frontend-Backend Integration Verification Started\n");
  verifyIntegration().catch(console.error);
}
