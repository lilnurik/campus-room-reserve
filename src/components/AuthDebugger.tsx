import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthDebugger() {
    const [token, setToken] = useState<string | null>(null);
    const [decodedToken, setDecodedToken] = useState<any>(null);
    const [testResult, setTestResult] = useState<string>('');

    useEffect(() => {
        // Get token from localStorage
        const storedToken = localStorage.getItem('authToken');
        setToken(storedToken);

        // Try to decode JWT payload (for debugging only)
        if (storedToken) {
            try {
                const base64Url = storedToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );
                setDecodedToken(JSON.parse(jsonPayload));
            } catch (e) {
                console.error('Error decoding token:', e);
            }
        }
    }, []);

    const testEndpoint = async () => {
        try {
            setTestResult('Testing...');

            const token = localStorage.getItem('authToken');
            const response = await fetch('http://127.0.0.1:5000/api/rooms/', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTestResult(`Success! Found ${data.length} rooms.`);
            } else {
                setTestResult(`Error: ${response.status} ${response.statusText}`);
                const text = await response.text();
                if (text) setTestResult(prev => `${prev}\n${text}`);
            }
        } catch (error) {
            setTestResult(`Fetch error: ${error.message}`);
        }
    };

    const clearToken = () => {
        localStorage.removeItem('authToken');
        window.location.reload();
    };

    return (
        <Card className="max-w-3xl mx-auto my-8">
            <CardHeader>
                <CardTitle>Auth Debugger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold mb-2">Current Auth Token:</h3>
                    <div className="bg-muted p-3 rounded-md overflow-auto max-h-24">
                        {token ? (
                            <code className="text-xs whitespace-pre-wrap">{token}</code>
                        ) : (
                            <em className="text-muted-foreground">No token found in localStorage</em>
                        )}
                    </div>
                </div>

                {decodedToken && (
                    <div>
                        <h3 className="font-semibold mb-2">Decoded Token Payload:</h3>
                        <div className="bg-muted p-3 rounded-md overflow-auto max-h-48">
              <pre className="text-xs">
                {JSON.stringify(decodedToken, null, 2)}
              </pre>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            Expires: {new Date(decodedToken.exp * 1000).toLocaleString()}
                        </p>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button onClick={testEndpoint}>Test Auth</Button>
                    <Button variant="destructive" onClick={clearToken}>Clear Token</Button>
                </div>

                {testResult && (
                    <div>
                        <h3 className="font-semibold mb-2">Test Result:</h3>
                        <div className="bg-muted p-3 rounded-md">
                            <pre className="text-xs whitespace-pre-wrap">{testResult}</pre>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}