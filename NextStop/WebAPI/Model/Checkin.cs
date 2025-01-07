using System;
using System.Collections.Generic;

namespace WebAPI.Model;

public partial class Checkin
{
    public int Id { get; set; }

    public int Routeid { get; set; }

    public int Stopid { get; set; }

    public DateTime Checkintime { get; set; }

    public int? Delayinminutes { get; set; }
}