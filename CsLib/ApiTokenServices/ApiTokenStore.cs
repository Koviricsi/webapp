using System.Collections.Concurrent;

public sealed class ApiTokenStore
{
    private readonly ConcurrentDictionary<string, byte> _tokens = new();

    public void Add(string jti)
    {
        _tokens.TryAdd(jti, 0);
    }

    public bool Contains(string jti)
    {
        return _tokens.ContainsKey(jti);
    }

    public void Remove(string jti)
    {
        _tokens.TryRemove(jti, out _);
    }
}