import { supabase } from "@/integrations/supabase/client";

export const createTestUser = async () => {
  try {
    // Create a test user account
    const { data, error } = await supabase.auth.signUp({
      email: "doctor@test.com",
      password: "test123456",
      options: {
        data: {
          full_name: "Dr. John Smith",
          role: "doctor",
          specialization: "Cardiology",
          license_number: "MD123456",
          phone: "+1 (555) 123-4567",
        },
      },
    });

    if (error) {
      console.error("Error creating test user:", error);
      return { success: false, error: error.message };
    }

    console.log("Test user created successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
};

// Test credentials for login
export const TEST_CREDENTIALS = {
  email: "doctor@test.com",
  password: "test123456",
  fullName: "Dr. John Smith",
  role: "doctor",
  specialization: "Cardiology",
};

// Function to check if test user exists
export const checkTestUser = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_CREDENTIALS.email,
      password: TEST_CREDENTIALS.password,
    });

    if (error) {
      console.log("Test user does not exist or credentials are invalid");
      return false;
    }

    console.log("Test user exists and credentials are valid");
    return true;
  } catch (error) {
    console.error("Error checking test user:", error);
    return false;
  }
}; 