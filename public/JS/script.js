document.addEventListener('DOMContentLoaded', async () => {
    const taxistasList = document.getElementById('taxistas-list');
    const usuariosList = document.getElementById('usuarios-list');

    try {
        const taxistasResponse = await fetch('/api/taxistas');
        if (!taxistasResponse.ok) {
            throw new Error(`HTTP error! status: ${taxistasResponse.status}`);
        }
        const taxistas = await taxistasResponse.json();

        if (taxistas.length > 0) {
            taxistasList.innerHTML = ''; 
            taxistas.forEach(t => {
                taxistasList.innerHTML += `<li class="list-group-item">🚕 ${t.Name} - ${t.car_model} (${t.car_license_plate})</li>`;
            });
        } else {
            taxistasList.innerHTML = `<li class="list-group-item text-muted">Nenhum taxista cadastrado ainda.</li>`;
        }


        const usuariosResponse = await fetch('/api/usuarios');
        if (!usuariosResponse.ok) {
            throw new Error(`HTTP error! status: ${usuariosResponse.status}`);
        }
        const usuarios = await usuariosResponse.json();
        
        if (usuarios.length > 0) {
            usuariosList.innerHTML = ''; 
            usuarios.forEach(u => {
                usuariosList.innerHTML += `<li class="list-group-item">👤 ${u.Name} - ${u.Email}</li>`;
            });
        } else {
            usuariosList.innerHTML = `<li class="list-group-item text-muted">Nenhum usuário cadastrado ainda.</li>`;
        }

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        taxistasList.innerHTML = `<li class="list-group-item text-danger">Erro ao carregar taxistas. Tente novamente mais tarde.</li>`;
        usuariosList.innerHTML = `<li class="list-group-item text-danger">Erro ao carregar usuários. Tente novamente mais tarde.</li>`;
    }
});