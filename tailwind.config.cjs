/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
	],
	theme: {
		extend: {
			colors: {
				slate: {
					150: '#EAEFF5',
					250: '#D7DFE9',
					350: '#B0BCCD',
					450: '#7C8CA2',
					550: '#56657A',
					650: '#3D4B5F',
					750: '#293548',
					850: '#172033',
					950: '#0A0F1C',
				},
				gray: {
					150: '#ECEEF1',
					250: '#DBDEE3',
					350: '#B7BCC5',
					450: '#848B98',
					550: '#5B6472',
					650: '#414B5A',
					750: '#2B3544',
					850: '#18212F',
					950: '#090C14',
				},
			},
			screens: {
				coarse: {raw: '(pointer: coarse)'},
				nohover: {raw: '(hover: none)'},
			},
			keyframes: {
				'spin-appear': {
					'0%, 100%': {transform: 'rotate(50deg)', opacity: 0, 'stroke-dashoffset': 60},
					'100%': {transform: 'rotate(230deg)', opacity: 1, 'stroke-dashoffset': 50},
				},
			},
			animation: {
				'spin-appear': '1s ease-in-out 0s 1 normal forwards running spin-appear',
				'spin-dynamic': '0.86s cubic-bezier(0.4, 0.15, 0.6, 0.85) 0s infinite normal none running spin',
			},
		},
	},
	plugins: [
		require('@tailwindcss/forms')({
			strategy: 'class',
		}),
		require('tailwind-scrollbar'),
	],
	experimental: {
		optimizeUniversalDefaults: true,
	},
	future: {
		hoverOnlyWhenSupported: true,
	},
};
