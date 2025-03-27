import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ApiTest() {
    const [token, setToken] = useState<string | null>(null);
    const [result, setResult] = useState<string>('');
    const [testMode, setTestMode] = useState<'default' | 'direct' | 'raw' | 'noBearer'>('default');

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        setToken(storedToken);
    }, []);

    const testRoomsApi = async () => {
        try {
            setResult('Testing...');

            const storedToken = localStorage.getItem('authToken');

            // Different test modes
            if (testMode === 'direct') {
                // Use the copy-pasted token from Swagger instead of localStorage
                const directToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MzA2NDc3MSwianRpIjoiOGRmNzYzNWUtZWRhNi00N2ViLTkwMDMtN2Q1ZDg0NzAwOWE2IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjMiLCJuYmYiOjE3NDMwNjQ3NzEsImNzcmYiOiIxOWQ2MGM1MS0wYmNkLTQxOGMtOWE4Zi0xZTZiNTAzYzFlNTMiLCJleHAiOjE3NDMxNTExNzF9.hfV_Lt-NTh80NRjQdOe1-mn9xvgMLucFQ8GqHp-EGVY';

                const response = await fetch('http://127.0.0.1:5000/api/rooms/', {
                    headers: {
                        'Authorization': `Bearer ${directToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                handleResponse(response);
            } else if (testMode === 'noBearer') {
                // Test without Bearer prefix (incorrect but helps diagnose issues)
                const response = await fetch('http://127.0.0.1:5000/api/rooms/', {
                    headers: {
                        'Authorization': storedToken || '',
                        'Content-Type': 'application/json'
                    }
                });

                handleResponse(response);
            } else if (testMode === 'raw') {
                // Simplest fetch request possible
                const response = await fetch('http://127.0.0.1:5000/api/rooms/', {
                    headers: {
                        'Authorization': `Bearer ${storedToken}`
                    }
                });

                handleResponse(response);
            } else {
                // Default mode - how it should be implemented
                const response = await fetch('http://127.0.0.1:5000/api/rooms/', {
                    headers: {
                        'Authorization': `Bearer ${storedToken}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                handleResponse(response);
            }
        } catch (error) {
            setResult(`Error: ${error.message}`);
        }
    };

    const handleResponse = async (response: Response) => {
        if (response.ok) {
            const data = await response.json();
            setResult(`Success! Got ${data.length} rooms.\n\nFirst room: ${JSON.stringify(data[0], null, 2)}`);
        } else {
            try {
                const text = await response.text();
                setResult(`Error ${response.status}: ${response.statusText}\n\n${text}`);
            } catch (e) {
                setResult(`Error ${response.status}: ${response.statusText}`);
            }
        }
    };

    return (
        <Card className="max-w-3xl mx-auto my-8">
            <CardHeader>
                <CardTitle>API Authentication Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold mb-2">Current Token:</h3>
                    <div className="bg-muted p-3 rounded-md overflow-auto max-h-24">
                        {token ? (
                            <code className="text-xs whitespace-pre-wrap">{token}</code>
                        ) : (
                            <em className="text-muted-foreground">No token found</em>
                        )}
                    </div>
                </div>

                <div className="flex flex-col space-y-2">
                    <select
                        value={testMode}
                        onChange={(e) => setTestMode(e.target.value as any)}
                        className="p-2 border rounded-md mb-2"
                    >
                        <option value="default">Default Mode</option>
                        <option value="direct">Direct Token Mode</option>
                        <option value="raw">Raw Request Mode</option>
                        <option value="noBearer">No Bearer Prefix Mode</option>
                    </select>

                    <Button onClick={testRoomsApi}>Test Rooms API</Button>
                </div>

                {result && (
                    <div>
                        <h3 className="font-semibold mb-2">Test Result:</h3>
                        <div className="bg-muted p-3 rounded-md overflow-auto max-h-80">
                            <pre className="text-xs whitespace-pre-wrap">{result}</pre>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}