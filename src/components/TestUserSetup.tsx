import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createTestUser, checkTestUser, TEST_CREDENTIALS } from "@/utils/createTestUser";
import { User, CheckCircle, AlertCircle, Copy } from "lucide-react";
import { toast } from "sonner";

const TestUserSetup = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);

  const handleCreateTestUser = async () => {
    setIsCreating(true);
    try {
      const result = await createTestUser();
      if (result.success) {
        toast.success("Test user created successfully!");
        setUserExists(true);
      } else {
        toast.error(`Failed to create test user: ${result.error}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCheckTestUser = async () => {
    setIsChecking(true);
    try {
      const exists = await checkTestUser();
      setUserExists(exists);
      if (exists) {
        toast.success("Test user exists and is ready to use!");
      } else {
        toast.info("Test user does not exist. Please create one.");
      }
    } catch (error) {
      toast.error("Error checking test user");
    } finally {
      setIsChecking(false);
    }
  };

  const copyCredentials = () => {
    const credentials = `Email: ${TEST_CREDENTIALS.email}\nPassword: ${TEST_CREDENTIALS.password}`;
    navigator.clipboard.writeText(credentials);
    toast.success("Credentials copied to clipboard!");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Test User Setup
        </CardTitle>
        <CardDescription>
          Create a test account for development and testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {userExists === true && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Test user exists and is ready to use!
            </AlertDescription>
          </Alert>
        )}

        {userExists === false && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Test user does not exist. Please create one.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">Test Credentials:</h4>
          <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
            <div><strong>Email:</strong> {TEST_CREDENTIALS.email}</div>
            <div><strong>Password:</strong> {TEST_CREDENTIALS.password}</div>
            <div><strong>Name:</strong> {TEST_CREDENTIALS.fullName}</div>
            <div><strong>Role:</strong> {TEST_CREDENTIALS.role}</div>
            <div><strong>Specialization:</strong> {TEST_CREDENTIALS.specialization}</div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyCredentials}
            className="w-full"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Credentials
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={handleCheckTestUser}
            disabled={isChecking}
            variant="outline"
            className="flex-1"
          >
            {isChecking ? "Checking..." : "Check User"}
          </Button>
          <Button 
            onClick={handleCreateTestUser}
            disabled={isCreating}
            className="flex-1"
          >
            {isCreating ? "Creating..." : "Create Test User"}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Use these credentials to login to the application
        </div>
      </CardContent>
    </Card>
  );
};

export default TestUserSetup; 