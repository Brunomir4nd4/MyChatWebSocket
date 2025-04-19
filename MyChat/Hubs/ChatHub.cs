using Microsoft.AspNetCore.SignalR;
using MyChat.Repositories;
using MyChat.Models;
using System.Text.Json;
using MyChat.Repositories.Interfaces;

namespace MyChat.Hubs
{
    public class ChatHub : Hub
    {
        private readonly IConnectionRepository _connectionRepository;

        public ChatHub(IConnectionRepository connectionRepo)
        {
            _connectionRepository = connectionRepo;
        }

        /// <summary>
        /// Override para inserir cada usuário no nosso repositório, lembrando que esse repositório está em memória
        /// </summary>
        /// <returns> Retorna lista de usuário no chat e usuário que acabou de logar </returns>
        public override Task OnConnectedAsync()
        {
            var user = JsonSerializer.Deserialize<User>(Context.GetHttpContext().Request.Query["user"]);
            _connectionRepository.Add(Context.ConnectionId, user);
            Clients.All.SendAsync("chat", _connectionRepository.GetAllUser(), user);
            return base.OnConnectedAsync();
        }

        /// <summary>
        /// Método responsável por encaminhar as mensagens pelo hub
        /// </summary>
        /// <param name="ChatMessage">Este parâmetro é nosso objeto representando a mensagem e os usuários envolvidos</param>
        /// <returns></returns>
        public async Task SendMessage(Message chatMessage)
        {
            var user = _connectionRepository.GetUserId(chatMessage.destination);
            //Ao usar o método Client(user) eu estou enviando a mensagem apenas para o usuário destino, não realizando broadcast
            var client = Clients.Client(user);
            if (client != null)
            {
                await client.SendAsync("Receive", chatMessage.sender, chatMessage.message);
            }
        }
    }
}
