import { NextRequest, NextResponse } from 'next/server';
import { addSubscriberToForm, createKitSubscriber } from '../utils';
import { KIT_FORM_ID } from 'app/constants';

// Set to edge runtime for better performance
export const runtime = 'edge';

// Handle POST requests for new subscribers
export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const body = await request.json();
    console.log('📝 SUBSCRIBE - Received payload:', body);
    
    // Extract needed fields and validate
    const { email_address, referrer, form_id } = body as { email_address?: string; referrer?: string; form_id?: number };
    console.log('📝 SUBSCRIBE - Using form ID:', form_id);

    if (!email_address) {
      return NextResponse.json({ success: false, error: 'Email address is required' }, { status: 400 });
    }
    // Determine which form ID to use (body overrides environment)
    const formIdValue = typeof form_id === 'number' && form_id > 0 ? form_id : KIT_FORM_ID;
    if (!formIdValue) {
      return NextResponse.json({ success: false, error: 'Form ID is not configured' }, { status: 500 });
    }

    try {
      const httpReferrer = request.headers.get('referer') || '';
      // First, ensure the subscriber exists (upsert via Subscribers API)
      await createKitSubscriber(email_address);
      // Now add the subscriber to the Kit Form to capture attribution
      const subscriber = await addSubscriberToForm(formIdValue, {
        email_address,
        referrer: referrer || httpReferrer || '',
      });
      
      console.log('✅ SUBSCRIBE - Successfully subscribed:', email_address);
      return NextResponse.json({ success: true, message: 'Successfully subscribed! 😊', subscriber });
    } catch (error) {
      console.error('❌ SUBSCRIBE - Error:', error instanceof Error ? error.message : 'Failed to subscribe');
      return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed to subscribe' }, { status: 422 });
    }
  } catch (error) {
    console.error('❌ SUBSCRIBE - Error in API route:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 