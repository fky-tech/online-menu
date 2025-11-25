'use client';

export default function GlobalError({ error, reset }) {
    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-white text-black">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Critical Application Error</h2>
                    <p className="mb-4">Something went wrong in the root layout.</p>
                    <div className="bg-gray-100 p-4 rounded-lg mb-4 max-w-lg overflow-auto text-left">
                        <p className="font-mono text-sm text-red-500">{error.message}</p>
                    </div>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
