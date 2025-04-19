class ChatController {
    constructor() {
        this.state = {
            key: null,
            name: null,
            dtConnection: null
        };
        this.connection = null;
    }

    async initialize() {
        await this.loadUser();
    }

    async loadUser() {
        this.state.name = prompt('Digite seu nome para entrar no chat', 'Usuário') || 'Ghest';
        this.state.key = Date.now();
        this.state.dtConnection = new Date();

        await this.connectToChat();
    }

    async connectToChat() {
        try {
            let userParams = `user=${JSON.stringify(this.state)}`

            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(`/chat?${userParams}`)
                .configureLogging(signalR.LogLevel.Warning)
                .build();

            this.setupEventHandlers();
            await this.connection.start();
            console.log('Conexão com o chat estabelecida');

        } catch (error) {
            console.error('Falha ao conectar:', error);
            setTimeout(() => this.connectToChat(), 5000);
        }
    }

    setupEventHandlers() {
        this.connection.onclose(async error => {
            console.log('Conexão perdida. Reconectando...', error);
        });

        this.connection.on('Receive', (sender, message) => {
            this.openChatWindow(null, sender, message);
        });

        this.connection.on('chat', (users) => {
            this.renderUserList(users);
        });
    }

    async sendMessage({ destination, field, message }) {
        if (!message.trim()) return;

        const chatMessage = {
            sender: this.state,
            message: message.trim(),
            destination
        };

        try {
            await this.connection.invoke("SendMessage", chatMessage);
            this.insertMessage(destination, 'me', message);
            field.val('').focus();
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
        }
    }

    renderUserList(users) {
        const filteredUsers = users.filter(u =>
            u.key !== this.state.key && !this.checkIfElementExists(u.key, 'id')
        );

        const userElements = filteredUsers.map(user => `
            <section class="user box_shadow_0" onclick="chat.openChatWindow(this)" 
                     data-id="${user.key}" data-name="${user.name}">
                <span class="user_icon">${user.name.charAt(0)}</span>
                <p class="user_name">${user.name}</p>
                <span class="user_date">${new Date(user.dtConnection).toLocaleDateString()}</span>
            </section>
        `).join('');

        $('.main').append(userElements);
    }

    openChatWindow(element, sender, message) {
        const user = element ? {
            id: $(element).data('id'),
            name: $(element).data('name')
        } : {
            id: sender.key,
            name: sender.name
        };

        if (!this.checkIfElementExists(user.id, 'chat')) {
            const chatWindow = `
                <section class="chat" data-chat="${user.id}">
                    <header>${user.name}</header>
                    <main></main>
                    <footer>
                        <input type="text" placeholder="Digite aqui sua mensagem" data-chat="${user.id}">
                        <a onclick="chat.sendMessageFromUI(this)" data-chat="${user.id}">Enviar</a>
                    </footer>
                </section>
            `;
            $('.chats_wrapper').append(chatWindow);
        }

        if (message) {
            this.insertMessage(sender.key, 'their', message);
        }
    }

    insertMessage(targetId, senderType, message) {
        const messageElement = `
            <div class="message ${senderType}">
                ${message} 
                <span>${new Date().toLocaleTimeString()}</span>
            </div>
        `;
        $(`section[data-chat="${targetId}"] main`).append(messageElement);
    }

    checkIfElementExists(id, dataAttribute) {
        return $(`section[data-${dataAttribute}="${id}"]`).length > 0;
    }

    sendMessageFromUI(element) {
        const chatId = $(element).data('chat');
        const inputField = $(`input[data-chat="${chatId}"]`);

        this.sendMessage({
            destination: chatId,
            field: inputField,
            message: inputField.val()
        });
    }
}

// Inicialização do chat quando o DOM estiver pronto
$(document).ready(async () => {
    window.chat = new ChatController();
    await chat.initialize();
});