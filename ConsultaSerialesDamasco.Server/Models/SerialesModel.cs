namespace ConsultaSerialesDamasco.Server.Models
{
    public class SerialesModel
    {
        public DateTime DateSerial {  get; set; }
        public string SerialNumber { get; set; }
        public string ProductSku { get; set; }
        public string ProductName { get; set; }
        public int NumberMovement { get; set; }
      

        public string WarehouseId { get; set; }

        public string WarehouseName { get; set; }

        public string TypeMovement { get; set; }
    }
}
