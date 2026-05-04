'use server'

import { EventSource } from 'eventsource';
// @ts-ignore
global.EventSource = EventSource;

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

export async function createLeadAction(formData: FormData) {
  const data = {
    FirstName: formData.get('firstName') as string,
    LastName: formData.get('lastName') as string,
    Company: formData.get('company') as string,
    Email: formData.get('email') as string,
    Phone: formData.get('phone') as string,
    Description: 'Lead generated via Headless MCP Next.js Portal'
  };

  // The Server URL from your Salesforce MCP Servers page
  const mcpServerUrl = new URL('https://api.salesforce.com/platform/mcp/v1/platform/sobject-all');
  
  // NOTE: You need to pass your Salesforce Access Token to authenticate against the hosted MCP server.
  // In a real app, this would be fetched via Client Credentials or JWT Bearer flow.
  const accessToken = process.env.SF_ACCESS_TOKEN;
  
  if (!accessToken) {
      console.warn("SF_ACCESS_TOKEN not found in environment variables. Connection may fail.");
  }

  // 1. Initialize the SSE Transport to connect to the Salesforce Hosted MCP Server
  // We pass the Authorization header in the requestInit for the SSE connection
  const transport = new SSEClientTransport(mcpServerUrl, {
    requestInit: {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
  });

  const client = new Client({ name: 'bobcat-nextjs-portal', version: '1.0.0' }, { capabilities: {} });
  
  try {
    await client.connect(transport);

    // 2. Use the 'createSobjectRecord' tool defined in the sobject-all server
    const result = await client.callTool({
      name: 'createSobjectRecord', 
      arguments: {
        "sobject-name": "Lead",
        "body": data
      }
    });

    // 3. Parse and return the result
    const content = result.content as { type: string; text: string }[];
    const responseText = content[0].text;
    const parsedResponse = JSON.parse(responseText);
    
    // The createSobjectRecord tool returns the ID on success
    return { success: true, leadId: parsedResponse.id || parsedResponse.Id || "Unknown_ID" };
    
  } catch (error: any) {
    console.error('MCP Error:', error);
    return { success: false, error: error.message || 'Failed to create lead via MCP.' };
  } finally {
    // Always clean up the connection
    await client.close(); 
  }
}
