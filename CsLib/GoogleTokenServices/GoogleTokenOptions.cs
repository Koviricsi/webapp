namespace GoogleTokenServices;

public sealed class GoogleTokenOptions
{
    public string ClientId { get; set; } = "";
    public bool? EmailVerified { get; set; }
    public string? HostedDomain { get; set; }
}
    