document.addEventListener('DOMContentLoaded', () => {
    const usuariosListElement = document.getElementById('usuarios-list');
    if (usuariosListElement) {
        fetchUsuarios();
        usuariosListElement.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-btn')) {
                const id = event.target.dataset.id;
                const type = event.target.dataset.type;
                if (confirm(`Tem certeza que deseja excluir este ${type}?`)) {
                    deleteItem(id, type);
                }
            }
        });
    }

    const taxistasListElement = document.getElementById('taxistas-list');
    if (taxistasListElement) {
        fetchTaxistas();
        taxistasListElement.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-btn')) {
                const id = event.target.dataset.id;
                const type = event.target.dataset.type;
                if (confirm(`Tem certeza que deseja excluir este ${type}?`)) {
                    deleteItem(id, type);
                }
            }
        });
    }
});

async function fetchUsuarios() {
    try {
        // CORRIGIDO: Adicionado '/api' ao URL e ajuste da porta para 3000
        const response = await fetch('http://localhost:3000/api/usuarios');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const usuarios = await response.json();
        const usuariosList = document.getElementById('usuarios-list');
        usuariosList.innerHTML = '';
        if (usuarios.length === 0) {
            usuariosList.innerHTML = '<li class="list-group-item">Nenhum usuário cadastrado.</li>';
            return;
        }
        usuarios.forEach(usuario => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.innerHTML = `
                <span>${usuario.Name}</span> <!-- Usando 'Name' conforme a coluna do seu banco de dados -->
                <button class="btn btn-danger btn-sm delete-btn" data-id="${usuario.idusers}" data-type="usuario">Excluir</button> <!-- Usando 'idusers' conforme a coluna do seu banco de dados -->
            `;
            usuariosList.appendChild(li);
        });
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        const usuariosList = document.getElementById('usuarios-list');
        if (usuariosList) {
            usuariosList.innerHTML = '<li class="list-group-item text-danger">Erro ao carregar usuários.</li>';
        }
    }
}

async function fetchTaxistas() {
    try {
        // CORRIGIDO: Adicionado '/api' ao URL e ajuste da porta para 3000
        const response = await fetch('http://localhost:3000/api/taxistas');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const taxistas = await response.json();
        const taxistasList = document.getElementById('taxistas-list');
        taxistasList.innerHTML = '';
        if (taxistas.length === 0) {
            taxistasList.innerHTML = '<li class="list-group-item">Nenhum taxista cadastrado.</li>';
            return;
        }
        taxistas.forEach(taxista => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.innerHTML = `
                <span>${taxista.Name}</span> <!-- Usando 'Name' conforme a coluna do seu banco de dados -->
                <button class="btn btn-danger btn-sm delete-btn" data-id="${taxista.Id_taxistas}" data-type="taxista">Excluir</button> <!-- Usando 'Id_taxistas' conforme a coluna do seu banco de dados -->
            `;
            taxistasList.appendChild(li);
        });
    } catch (error) {
        console.error('Erro ao buscar taxistas:', error);
        const taxistasList = document.getElementById('taxistas-list');
        if (taxistasList) {
            taxistasList.innerHTML = '<li class="list-group-item text-danger">Erro ao carregar taxistas.</li>';
        }
    }
}

async function deleteItem(id, type) {
    try {
        // CORRIGIDO: Adicionado '/api' ao URL
        const response = await fetch(`http://localhost:3000/api/${type}s/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.erro || 'Erro desconhecido'}`);
        }

        alert(`${type === 'usuario' ? 'Usuário' : 'Taxista'} excluído com sucesso!`);
        if (type === 'usuario') {
            fetchUsuarios();
        } else {
            fetchTaxistas();
        }
    } catch (error) {
        console.error(`Erro ao excluir ${type}:`, error);
        alert(`Erro ao excluir ${type === 'usuario' ? 'usuário' : 'taxista'}: ${error.message}`);
    }
}