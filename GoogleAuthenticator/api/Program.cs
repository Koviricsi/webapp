using GoogleTokenServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// A két autentikációs szolgáltatás regisztrációja.
GoogleTokenService.AddAuthentication(builder);
ApiTokenService.AddAuthentication(builder);

builder.Services.AddCors(options => 
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(["https://teszt.hbsz.eu", "http://localhost:5500", "https://localhost:5173"])
            .AllowAnyHeader()
            .AllowAnyMethod();
    }));
builder.Services.AddAuthorization();

var app = builder.Build();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

#region USER
// GET /user/me
app.MapGet("/users/me", (HttpContext context) =>
{
    var user = context.User;

    return Results.Ok(new
    {
        Subject = user.FindFirstValue(ClaimTypes.NameIdentifier),
        Email = user.FindFirstValue(ClaimTypes.Email),
        GivenName = user.FindFirstValue(ClaimTypes.GivenName),
        FamilyName = user.FindFirstValue(ClaimTypes.Surname),
        Picture = user.FindFirstValue("picture")
    });
})
.RequireAuthorization(new AuthorizeAttribute
{
    AuthenticationSchemes = "ApiToken"
});
#endregion

#region LOGIN/LOGOUT
// POST /auth/login
app.MapPost("/auth/login", (
    HttpContext context,
    ApiTokenService apiTokenService) =>
{
    var token = apiTokenService.CreateToken(context.User);

    return Results.Ok(new
    {
        AccessToken = token,
        TokenType = "Bearer"
    });
})
.RequireAuthorization(new AuthorizeAttribute
{
    AuthenticationSchemes = "GoogleToken"
});

// POST /auth/logout
app.MapPost("/auth/logout", (
    HttpContext context,
    ApiTokenService apiTokenService) =>
{
    var authorization = context.Request.Headers.Authorization.ToString();

    if (!AuthenticationHeaderValue.TryParse(authorization, out var header) ||
        !header.Scheme.Equals("Bearer", StringComparison.OrdinalIgnoreCase) ||
        string.IsNullOrWhiteSpace(header.Parameter))
    {
        return Results.Unauthorized();
    }

    apiTokenService.DeleteToken(header.Parameter);

    return Results.NoContent();
})
.RequireAuthorization(new AuthorizeAttribute
{
    AuthenticationSchemes = "ApiToken"
});
#endregion

app.Run();