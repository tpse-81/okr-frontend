import { error } from '@sveltejs/kit';

export function load() {
    error(500, 'etwas ist schief gegangen :/');
}
