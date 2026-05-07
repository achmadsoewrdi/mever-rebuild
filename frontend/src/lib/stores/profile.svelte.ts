// State global Svelte 5 untuk menyimpan nama profil
// agar otomatis terupdate di mana saja tanpa perlu refresh halaman
export const profileState = $state({
	name: ''
});
