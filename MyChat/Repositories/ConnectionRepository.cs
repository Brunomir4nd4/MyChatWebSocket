using MyChat.Models;
using MyChat.Repositories.Interfaces;

namespace MyChat.Repositories
{
    public class ConnectionRepository : IConnectionRepository
    {
        private readonly Dictionary<string, User> _connections = new Dictionary<string, User>();

        public void Add(string uniqueID, User user) 
        {
            if (!_connections.ContainsKey(uniqueID))
                _connections.Add(uniqueID, user);
        }

        public string GetUserId(long id) 
        {
            var query = from con in _connections
                        where con.Value.key == id
                        select con.Key;

            return query.FirstOrDefault()
                ?? throw new Exception("User not found");
        }

        public List<User> GetAllUser()
        {
            var query = from con in _connections
                        select con.Value;

            return query.ToList();
        }
    }
}
