import {getContext} from 'svelte';

export const makeid = (length = 10) => {
	let result = '';
	const characters = 'abcdefghijklmnopqrstuvwxyz';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(
			Math.floor(Math.random() * charactersLength),
		);
	}

	return result;
};

type FieldContext = {id: string};

export const getid = () => ((getContext<FieldContext>('field'))?.id) ?? makeid(10);
