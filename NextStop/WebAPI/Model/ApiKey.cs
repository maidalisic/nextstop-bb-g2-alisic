namespace WebAPI.Model;

public partial class ApiKey
{
    public int Id { get; set; }

    public int Clientid { get; set; }

    public string? Keyvalue { get; set; }

    public DateTime? CreatedAt { get; set; }
}