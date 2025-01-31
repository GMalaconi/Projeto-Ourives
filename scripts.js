let carrinho = [];
let tamanhosSelecionados = {};


function obterProduto(nome) {
    for (let categoria in produtos) {
        for (let produto of produtos[categoria]) {
            if (produto.nome === nome) {
                return produto;
            }
        }
    }
    return null;
}

function exibirCarrinho() {
    const carrinho = obterCarrinho();
    const listaCarrinho = document.getElementById('lista-carrinho');
    listaCarrinho.innerHTML = '';

    carrinho.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('item-carrinho');
        div.innerHTML = `
            <div>${item.nome} (${item.tamanho})</div>
            <div>
                <button class="btn btn-sm btn-primary" onclick="diminuirQuantidade('${item.nome}', '${item.tamanho}')">-</button>
                <span>Quantidade: ${item.quantidade}</span>
                <button class="btn btn-sm btn-primary" onclick="aumentarQuantidade('${item.nome}', '${item.tamanho}')">+</button>
            </div>
            <button class="btn btn-danger" onclick="removerDoCarrinho('${item.nome}', '${item.tamanho}')">Remover</button>
        `;
        listaCarrinho.appendChild(div);
    });
}



function aumentarQuantidade(nome, tamanho) {
    const carrinho = obterCarrinho();
    const item = carrinho.find(item => item.nome === nome && item.tamanho === tamanho);

    if (item) {
        item.quantidade += 1;
    }

    salvarCarrinho(carrinho);
    exibirCarrinho();
    atualizarContadorCarrinho();
}

function diminuirQuantidade(nome, tamanho) {
    const carrinho = obterCarrinho();
    const item = carrinho.find(item => item.nome === nome && item.tamanho === tamanho);

    if (item && item.quantidade > 1) {
        item.quantidade -= 1;
    } else if (item) {
        carrinho.splice(carrinho.indexOf(item), 1); // Remove item se quantidade for 1
    }

    salvarCarrinho(carrinho);
    exibirCarrinho();
    atualizarContadorCarrinho();
}


function atualizarContadorCarrinho() {
    const carrinho = obterCarrinho();
    const contadorCarrinho = document.getElementById('contador-carrinho');
    contadorCarrinho.textContent = carrinho.length;
}



function limparCarrinho() {
    localStorage.removeItem('carrinho');
    document.getElementById('observacoes').value = ''; // Limpa o campo de observações
    exibirCarrinho();
    atualizarContadorCarrinho();
}



function salvarCarrinho(carrinho) {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}


function obterCarrinho() {
    return JSON.parse(localStorage.getItem('carrinho')) || [];
}

function mostrarCarrinho() {
    $('#popup-carrinho').modal('show');
}

function fecharCarrinho() {
    $('#popup-carrinho').modal('hide');
}

function atualizarContadorCarrinho() {
    const carrinho = obterCarrinho();
    const contadorCarrinho = document.getElementById('contador-carrinho');
    contadorCarrinho.textContent = carrinho.length;
}


function gerarOrcamentoWhatsapp() {
    const carrinho = obterCarrinho();
    let mensagem = "Olá, gostaria de enviar o orçamento dos seguintes itens:\n\n";

    carrinho.forEach(item => {
        const codigo = item.codigo || 'N/A';
        const nome = item.nome;
        const quantidade = item.quantidade;
        const tamanho = item.tamanho === "N/A" ? "" : `Tamanho: ${item.tamanho}\n`;
        mensagem += `Produto: ${nome}\nCódigo: ${codigo}\nQuantidade: ${quantidade}\n${tamanho}\n`;
    });

    const observacoes = document.getElementById('observacoes').value;
    if (observacoes) {
        mensagem += `Observações: ${observacoes}\n`;
    }

    const numeroWhatsapp = "+557181193358"; // Número de WhatsApp para envio
    const mensagemEncoded = encodeURIComponent(mensagem);
    const urlWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${mensagemEncoded}`;
    window.open(urlWhatsapp, '_blank');

    // Limpa o carrinho e o campo de observações após enviar a mensagem
    limparCarrinho();
}


document.addEventListener('DOMContentLoaded', function() {
    fetch('produtos.json')
        .then(response => response.json())
        .then(data => {
            produtos = data;
            let todosProdutos = [];
            for (let categoria in produtos) {
                todosProdutos = todosProdutos.concat(produtos[categoria]);
            }
            mostrarProdutos(todosProdutos);
            exibirCarrinho();
            atualizarContadorCarrinho();
        })
        .catch(error => console.error('Erro ao carregar produtos:', error));
});



function mostrarProdutos(produtosFiltrados) {
    const produtosSection = document.getElementById('produtos');
    produtosSection.innerHTML = '';

    produtosFiltrados.forEach(produto => {
        const div = document.createElement('div');
        div.classList.add('col-md-4', 'mb-4');
        div.setAttribute('data-produto', produto.nome);
        div.innerHTML = `
            <div class="card text-center">
                <div id="carousel-${produto.nome.replace(/\s+/g, '')}" class="carousel slide" data-ride="carousel">
                    <div class="carousel-inner">
                        ${produto.imagens.map((imagem, index) => `
                            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                <img src="${imagem}" class="d-block w-100" onclick="abrirZoom('${imagem}')">
                            </div>
                        `).join('')}
                    </div>
                    <a class="carousel-control-prev" href="#carousel-${produto.nome.replace(/\s+/g, '')}" role="button" data-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="sr-only">Previous</span>
                    </a>
                    <a class="carousel-control-next" href="#carousel-${produto.nome.replace(/\s+/g, '')}" role="button" data-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="sr-only">Next</span>
                    </a>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${produto.nome}</h5>
                    <p class="card-text">${produto.descricao}</p>
                    <div class="tamanhos d-flex justify-content-center">
                        ${produto.tamanhos.map(tamanho => `
                            ${tamanho.valor ? `
                                <div class="tamanho ${tamanho.disponivel ? '' : 'disabled'}" 
                                     onclick="selecionarTamanho('${produto.nome}', '${tamanho.valor}', ${tamanho.disponivel})">
                                     ${tamanho.valor}
                                </div>
                            ` : ''}
                        `).join('')}
                    </div>
                    <button class="btn btn-primary mt-3" onclick="adicionarAoCarrinho('${produto.nome}', 1, getTamanhoSelecionado('${produto.nome}'))">Adicionar ao Carrinho</button>
                </div>
            </div>
        `;
        produtosSection.appendChild(div);
    });
}



function filtrarCategoria(categoria) {
    mostrarProdutos(produtos[categoria]);
}

function filtrarSubcategoria(categoria, subcategoria) {
    const produtosFiltrados = produtos[categoria].filter(produto => produto.subcategoria === subcategoria);
    mostrarProdutos(produtosFiltrados);
}
function selecionarTamanho(produtoNome, tamanhoValor, disponivel) {
    if (!disponivel) return;

    const produtoElement = document.querySelector(`[data-produto="${produtoNome}"]`);
    if (!produtoElement) return;

    const tamanhos = produtoElement.querySelectorAll('.tamanho');

    tamanhos.forEach(tamanho => {
        if (tamanho.textContent.trim() === tamanhoValor.trim()) {
            tamanho.classList.add('selected');
        } else {
            tamanho.classList.remove('selected');
        }
    });
}



function getTamanhoSelecionado(produtoNome) {
    const produtoElement = document.querySelector(`[data-produto="${produtoNome}"]`);
    if (!produtoElement) return null;

    const tamanhoSelecionado = produtoElement.querySelector('.tamanho.selected');
    return tamanhoSelecionado ? tamanhoSelecionado.textContent.trim() : null;
}



function atualizarSelecaoTamanho(produto) {
    const produtoDiv = document.querySelector(`[data-produto="${produto}"]`);
    if (produtoDiv) {
        const tamanhosDivs = produtoDiv.querySelectorAll('.tamanho');
        tamanhosDivs.forEach(div => {
            div.classList.remove('selected');
            if (div.textContent.trim() === tamanhosSelecionados[produto]) {
                div.classList.add('selected');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const pathname = window.location.pathname;
    const carousel = document.getElementById('carousel-background');

    function esconderCarrossel() {
        if (carousel) {
            carousel.style.display = 'none';
        }
    }

    if (pathname === '/' || pathname.endsWith('/index.html')) {
        if (carousel) {
            carousel.style.display = 'block';
        }
    } else {
        esconderCarrossel();
    }

    // Adicionar evento para links de menu e submenu
    const menuLinks = document.querySelectorAll('.nav-link, .dropdown-item');
    menuLinks.forEach(link => {
        link.addEventListener('click', esconderCarrossel);
    });

    let todosProdutos = [];
    for (let categoria in produtos) {
        todosProdutos = todosProdutos.concat(produtos[categoria]);
    }
    mostrarProdutos(todosProdutos);

    exibirCarrinho();
    atualizarContadorCarrinho();
});



function adicionarAoCarrinho(nome, quantidade, tamanho) {
    // Percorre todas as categorias para encontrar o produto pelo nome
    let produto = null;
    for (const categoria in produtos) {
        produto = produtos[categoria].find(p => p.nome === nome);
        if (produto) break;
    }

    if (!produto) return; // Se não encontrar o produto, não adiciona ao carrinho

    // Verifica se o produto tem tamanhos e se o tamanho foi selecionado
    if (produto.tamanhos && produto.tamanhos.length > 0) {
        if (!tamanho) {
            alert("Por favor, selecione um tamanho para este produto.");
            return; // Não adiciona ao carrinho se o tamanho não foi selecionado
        }

        const tamanhoDisponivel = produto.tamanhos.some(t => t.valor === tamanho && t.disponivel);
        if (!tamanhoDisponivel) {
            alert("Este tamanho não está disponível.");
            return; // Não adiciona ao carrinho se o tamanho não estiver disponível
        }
    }

    const carrinho = obterCarrinho();
    const codigo = produto.codigo || gerarCodigoUnico();

    const itemExistente = carrinho.find(item => item.nome === nome && item.tamanho === tamanho);

    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        carrinho.push({
            nome: produto.nome,
            codigo: codigo,
            quantidade: quantidade,
            tamanho: tamanho || "N/A"
        });
    }

    salvarCarrinho(carrinho);
    atualizarContadorCarrinho();
    exibirCarrinho();

    // Remove a seleção do tamanho após adicionar ao carrinho
    const produtoElement = document.querySelector(`[data-produto="${nome}"]`);
    const tamanhos = produtoElement.querySelectorAll('.tamanho');
    tamanhos.forEach(tamanho => {
        tamanho.classList.remove('selected');
    });
}





function removerDoCarrinho(nome, tamanho) {
    let carrinho = obterCarrinho();
    carrinho = carrinho.filter(item => !(item.nome === nome && item.tamanho === tamanho));
    salvarCarrinho(carrinho);
    exibirCarrinho();
    atualizarContadorCarrinho();

}


// Exibe o popup ao carregar a página
window.onload = function() {
    document.getElementById('promoPopup').style.display = 'block';
};

// Fecha o popup quando o usuário clica no botão de fechar
document.querySelector('.close-btn').onclick = function() {
    document.getElementById('promoPopup').style.display = 'none';
};

// Fecha o popup quando o usuário clica fora da caixa de conteúdo
window.onclick = function(event) {
    if (event.target == document.getElementById('promoPopup')) {
        document.getElementById('promoPopup').style.display = 'none';
    }
};
