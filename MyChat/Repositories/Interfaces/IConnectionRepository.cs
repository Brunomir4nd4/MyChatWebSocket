using MyChat.Models;

namespace MyChat.Repositories.Interfaces
{
    public interface IConnectionRepository
    {
        void Add(string uniqueID, User user);
        string GetUserId(long id);
        List<User> GetAllUser();
    }
}
