using Microsoft.AspNetCore.Builder;
using System.Security.Claims;

namespace TokenServices
{
    public interface ITokenService
    {
        Task<ClaimsPrincipal> AuthenticateAsync(string token);

        static abstract void AddAuthentication(WebApplicationBuilder builder);
    }
}