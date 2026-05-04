'use server'

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

// Get OAuth token via Client Credentials flow
async function getOAuthToken(): Promise<string> {
  const instanceUrl = process.env.SF_INSTANCE_URL!;
  const clientId = process.env.SF_CLIENT_ID!;
  const clientSecret = process.env.SF_CLIENT_SECRET!;

  const tokenRes = await fetch(`${instanceUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || tokenData.error) {
    console.error('OAuth Error:', tokenData);
    throw new Error(`OAuth failed: ${tokenData.error_description || tokenData.error}`);
  }

  console.log('✅ OAuth token obtained. Scope:', tokenData.scope);
  return tokenData.access_token;
}

// Create Lead via hosted MCP server
export async function createLeadAction(formData: FormData) {
  const leadData = {
    FirstName: formData.get('firstName') as string,
    LastName: formData.get('lastName') as string,
    Company: formData.get('company') as string,
    Email: formData.get('email') as string,
    Phone: formData.get('phone') as string,
    Description: 'Lead generated via Salesforce Headless 360 Next.js Portal'
  };

  try {
    const accessToken = await getOAuthToken();

    const mcpServerUrl = new URL('https://api.salesforce.com/platform/mcp/v1/platform/sobject-all');

    const transport = new StreamableHTTPClientTransport(mcpServerUrl, {
      requestInit: {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    });

    const client = new Client({ name: 'bobcat-nextjs-portal', version: '1.0.0' }, { capabilities: {} });
    
    await client.connect(transport);

    const tools = await client.listTools();
    console.log('✅ MCP Connected! Tools:', tools.tools.map(t => t.name));

    const result = await client.callTool({
      name: 'createSobjectRecord',
      arguments: { "sobject-name": "Lead", "body": leadData }
    });

    if (result.isError) {
      const errorMsg = (result.content as {text: string}[])[0]?.text || 'MCP tool error';
      return { success: false, error: errorMsg };
    }

    const content = result.content as { type: string; text: string }[];
    const parsed = JSON.parse(content[0].text);
    const leadId = parsed.id || parsed.Id;

    console.log('✅ Lead created via MCP! ID:', leadId);
    return { success: true, leadId };

  } catch (error: any) {
    console.error('❌ MCP Error:', error.message);
    return { success: false, error: error.message || 'Failed to create lead via MCP.' };
  }
}
