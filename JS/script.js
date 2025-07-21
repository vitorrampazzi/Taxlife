    // Simulação de busca de dados no backend
    document.addEventListener('DOMContentLoaded', () => {
      const taxistas = [
        { id: 1, name: 'José Silva', car: 'Toyota Corolla' },
        { id: 2, name: 'Maria Santos', car: 'Honda Civic' },
      ];

      const usuarios = [
        { id: 1, name: 'João Oliveira', email: 'joao@mail.com' },
        { id: 2, name: 'Ana Paula', email: 'ana@mail.com' },
      ];

      // Populando taxistas
      const taxistasList = document.getElementById('taxistas-list');
      taxistas.forEach(t => {
        taxistasList.innerHTML += `<li class="list-group-item">🚕 ${t.name} - ${t.car}</li>`;
      });

      // Populando usuários
      const usuariosList = document.getElementById('usuarios-list');
      usuarios.forEach(u => {
        usuariosList.innerHTML += `<li class="list-group-item">👤 ${u.name} - ${u.email}</li>`;
      });
    });