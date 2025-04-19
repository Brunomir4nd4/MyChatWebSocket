using MyChat.Repositories;
using MyChat.Repositories.Interfaces;

namespace MyChat.Ioc
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddServiceColletions(this IServiceCollection services)
        {
            services.AddSingleton<IConnectionRepository, ConnectionRepository>();
            return services;
        }
    }
}