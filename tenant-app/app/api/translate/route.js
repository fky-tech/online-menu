import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { text, targetLang } = body;

        if (!text || !targetLang) {
            return NextResponse.json(
                { success: false, message: 'Text and target language are required' },
                { status: 400 }
            );
        }

        // Use Google Translate API (free tier via proxy)
        // This proxies to avoid CORS issues
        const response = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Translation API returned ${response.status}`);
        }

        const data = await response.json();

        // Extract translated text from Google's response format
        const translatedText = data[0]?.map(item => item[0]).join('') || text;

        return NextResponse.json({
            success: true,
            translatedText
        });
    } catch (error) {
        console.error('Translation error:', error);
        return NextResponse.json(
            { success: false, message: 'Translation failed', translatedText: request.body.text },
            { status: 500 }
        );
    }
}
