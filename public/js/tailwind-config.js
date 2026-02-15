window.tailwindConfig = {
    theme: {
        extend: {
            fontFamily: {
                heading: ['Lora', 'Georgia', 'serif'],
                body: ['Raleway', 'system-ui', 'sans-serif'],
            },
            colors: {
                primary: '#A7C7E7',
                secondary: '#C3B1E1',
                accent: '#B5D8B0',
                surface: '#FAF9F6',
                card: '#FFFFFF',
                ink: '#2D3748',
                muted: '#718096',
                peach: '#F5D5C8',
                blush: '#F2E1EB',
            },
        },
    },
};

// Apply to tailwind if already loaded
if (window.tailwind) {
    tailwind.config = window.tailwindConfig;
}
