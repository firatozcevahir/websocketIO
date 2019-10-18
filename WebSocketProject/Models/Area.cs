using System;
using System.Collections.Generic;

namespace WebSocketProject.Models
{
    public partial class Area
    {
        public Area()
        {
            Switch = new HashSet<Switch>();
        }

        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsSelected { get; set; }
        public string SocketIp { get; set; }

        public virtual ICollection<Switch> Switch { get; set; }
    }
}
