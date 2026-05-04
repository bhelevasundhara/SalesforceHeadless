'use server'

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export async function createLeadAction(formData: FormData) {
  const data = {
    FirstName: formData.get('firstName') as string,
    LastName: formData.get('lastName') as string,
    Company: formData.get('company') as string,
    Email: formData.get('email') as string,
    Phone: formData.get('phone') as string,
    Description: 'Lead generated via Headless MCP Next.js Portal'
  };

  // Use the local Salesforce CLI MCP server, explicitly targeting the correct org
  const transport = new StdioClientTransport({
    command: process.platform === 'win32' ? 'npx.cmd' : 'npx',
    args: ['-y', '@salesforce/mcp', '-o', 'vasundharab@softclouds.com.dev', '--toolsets', 'data'],
    env: { ...process.env } as Record<string, string>
  });

  const client = new Client({ name: 'bobcat-nextjs-portal', version: '1.0.0' }, { capabilities: {} });
  
  try {
    await client.connect(transport);

    // First, list available tools so we can see what's exposed
    const tools = await client.listTools();
    console.log('Available MCP Tools:', JSON.stringify(tools.tools.map(t => t.name), null, 2));

    // Use the 'createSobjectRecord' tool defined in the sobject-all server
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
