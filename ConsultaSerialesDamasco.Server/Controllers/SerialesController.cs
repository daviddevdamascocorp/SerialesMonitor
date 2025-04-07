using ConsultaSerialesDamasco.Server.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Data.SqlClient;

namespace ConsultaSerialesDamasco.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SerialesController : ControllerBase
    {
        private SqlConnection _connectionDamasco;
        public IConfiguration _configuration { get; }

        public SerialesController(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public void connection()
        {
            string connectionTransViaje = _configuration["ConnectionStrings:SQLConnection"];
            _connectionDamasco = new SqlConnection(connectionTransViaje);
        }

        [HttpGet("almacenes")]
        public IActionResult GetWarehouse()
        {
            List<WarehouseModel> whs = new List<WarehouseModel>();
            connection();
        
            SqlCommand command = new SqlCommand("select * from OWHS where WhsName    NOT LIKE '%(Inactivo)%' and ( WhsName LIKE '%Principal%' or WhsName LIKE '%Defectuoso%' or " +
                "WhsName LIKE '%Transito%' or WhsName LIKE '%Outlet%' or WhsName LIKE '%Oulet%' " +
                "or WhsName LIKE '%Detalle%' or WhsName LIKE '%Defectos%'  or WhsName LIKE '%EXHIBICION%'  or WhsName LIKE '%GENERAL%') ", _connectionDamasco);
            SqlDataAdapter adapter = new SqlDataAdapter(command);
            System.Data.DataTable dataTable = new System.Data.DataTable();
            _connectionDamasco.Open();
            adapter.Fill(dataTable);
            _connectionDamasco.Close();
            foreach (DataRow dr in dataTable.Rows)
            {
                whs.Add(new WarehouseModel
                {
                    WhsName = Convert.ToString(dr["WhsName"]).Trim(),
                    WhsCode = Convert.ToString(dr["WhsCode"]).Trim()
                });
            }
              
                _connectionDamasco.Close();
            return Ok(whs);
        }
        [HttpGet("productos")]
        public IActionResult GetProducts() 
        { List<ItemModel> items = new List<ItemModel>();

            connection();
      
            SqlCommand command = new SqlCommand("select itemcode,itemname from OITM where ItemCode NOT LIKE 'N000%' and ItemCode NOT LIKE 'M%' and  ItemCode NOT LIKE 'C%'",_connectionDamasco);
            SqlDataAdapter adapter = new SqlDataAdapter(command);
            System.Data.DataTable dataTable = new System.Data.DataTable();
            _connectionDamasco.Open();
            adapter.Fill(dataTable);
            _connectionDamasco.Close();
            foreach (DataRow dr in dataTable.Rows)
            {
                items.Add(new ItemModel {
                    ProductName = Convert.ToString(dr["itemname"]).Trim(),
                    ProductSku = Convert.ToString(dr["itemcode"]).Trim()
                });
            }
            
            _connectionDamasco.Close();
            return Ok(items);

        }

        [HttpGet("seriales")]
        public IActionResult GetSerials()
        {
            MnfSerialModel mnfSerialModel = new MnfSerialModel();
            connection();
            _connectionDamasco.Open();
            SqlCommand command = new SqlCommand("select MnfSerial  from OSRN");
            SqlDataAdapter adapter = new SqlDataAdapter(command);
         
            using (var reader = command.ExecuteReader())
            { 
                mnfSerialModel.ProductSerial = Convert.ToString(reader["MnfSerial"]).Trim();
            }
            _connectionDamasco.Close();
            return Ok(mnfSerialModel);
        }
        [HttpGet("serialesporsku/{sku}")]
        public IActionResult GetProductsSerial(String sku) {  
            List<MnfSerialModel> itemsSerial = new List<MnfSerialModel>();
            connection();
          
            SqlCommand command = new SqlCommand("select MnfSerial  from OSRN where ItemCode = @itemCode", _connectionDamasco);
            SqlDataAdapter adapter = new SqlDataAdapter(command);
            command.Parameters.AddWithValue("@itemCode", sku);
            System.Data.DataTable dataTable = new System.Data.DataTable();
            _connectionDamasco.Open();
            adapter.Fill(dataTable);
            _connectionDamasco.Close();
            foreach (DataRow dr in dataTable.Rows)
            {
                itemsSerial.Add(new MnfSerialModel
                { 
                    ProductSerial = Convert.ToString(dr["MnfSerial"]).Trim(),


                });
            }
           
            
            
           
            return Ok(itemsSerial);
        }

        [HttpPost("por-serial")]
        public IActionResult ConsultaSeriales(ConsultaModel consulta) {
            List<SerialesModel> seriales = new List<SerialesModel>();
            connection();
            
            SqlCommand command = new SqlCommand("GetSerialesMovimientoSerial", _connectionDamasco);
            command.CommandType = System.Data.CommandType.StoredProcedure;
            SqlDataAdapter adapter = new SqlDataAdapter(command);
            command.Parameters.AddWithValue("@SerialProd", consulta.Serial);
            System.Data.DataTable dataTable = new System.Data.DataTable();
            command.CommandTimeout = 3600;
            _connectionDamasco.Open();
            adapter.Fill(dataTable);
           
            foreach (DataRow item in dataTable.Rows) 
            {
                var precio = 0.0;
                var ProductSku = Convert.ToString(item["Sku"]);
                var ProductSkuPriceSQl = new SqlCommand("select Price from ITM1 where ItemCode = @itemCode", _connectionDamasco);
                ProductSkuPriceSQl.Parameters.AddWithValue("@itemCode", ProductSku);
                using (var reader = ProductSkuPriceSQl.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        precio = Convert.ToDouble(reader["Price"]);
                    }
                }
                seriales.Add(new SerialesModel {
                SerialNumber = Convert.ToString(item["SerialSku"]),
                DateSerial = Convert.ToDateTime(item["FechaMov"]),
                ProductSku = Convert.ToString(item["Sku"]),
                ProductName = Convert.ToString(item["Descrip"]),
                NumberMovement = Convert.ToInt32(item["LineNum"]),
                WarehouseId = Convert.ToString(item["WhsCode"]),
                WarehouseName = Convert.ToString(item["Sucursal"]),
                PriceSku = precio,
                TypeMovement = Convert.ToString(item["TipoDeDocumento"])
               });
            }
            _connectionDamasco.Close();
            return Ok(seriales);

        }
        //consulto por sku y serial
        [HttpPost("sku-serial-existente")]
        public IActionResult ConsultaSerialesConSkuEspecifico(ConsultaModel consulta)
        {
            List<SerialesModel> seriales = new List<SerialesModel>();
            connection();
            SqlCommand command = new SqlCommand("GetSerialesMovimientoSkuAndSerial", _connectionDamasco);
            System.Data.DataTable dataTable = new System.Data.DataTable();
            SqlDataAdapter adapter = new SqlDataAdapter(command);
            command.CommandType = System.Data.CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@SkuProd", consulta.Sku);
            command.Parameters.AddWithValue("@serialId", consulta.Serial);
            command.CommandTimeout = 3600;
            _connectionDamasco.Open();
            adapter.Fill(dataTable);
          
            foreach (DataRow item in dataTable.Rows)
            {
                var precio = 0.0;
                var ProductSku = Convert.ToString(item["Sku"]);
                var ProductSkuPriceSQl = new SqlCommand("select Price from ITM1 where ItemCode = @itemCode", _connectionDamasco);
                ProductSkuPriceSQl.Parameters.AddWithValue("@itemCode", ProductSku);
                using (var reader = ProductSkuPriceSQl.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        precio = Convert.ToDouble(reader["Price"]);
                    }
                }
                seriales.Add(new SerialesModel
                {
                    SerialNumber = Convert.ToString(item["SerialSku"]),
                    DateSerial = Convert.ToDateTime(item["FechaMov"]),
                    ProductSku = Convert.ToString(item["Sku"]),
                    ProductName = Convert.ToString(item["Descrip"]),
                    NumberMovement = Convert.ToInt32(item["LineNum"]),
                    WarehouseId = Convert.ToString(item["WhsCode"]),
                    PriceSku = precio,
                    WarehouseName = Convert.ToString(item["Sucursal"]),
                    TypeMovement = Convert.ToString(item["TipoDeDocumento"])
                });
            }
            _connectionDamasco.Close();
            return Ok(seriales);
        }
        //consulto por sku,serial y almacen
        [HttpPost("sku-almacen-serial")]
        public IActionResult ConsultaSerialesConSkuEspecificoAlmacenSerial(ConsultaModel consulta)
        {
            List<SerialesModel> seriales = new List<SerialesModel>();
            connection();
            //GetSerialesMovimientoSkuAndProductAndWarehouse
            SqlCommand command = new SqlCommand("GetSerialesMovimientoSkuAndProductAndWarehouse", _connectionDamasco);
            System.Data.DataTable dataTable = new System.Data.DataTable();
            command.CommandType = System.Data.CommandType.StoredProcedure;
            SqlDataAdapter adapter = new SqlDataAdapter(command);
            command.Parameters.AddWithValue("@SkuProd", consulta.Sku);
            command.Parameters.AddWithValue("@serialId", consulta.Serial);
            command.Parameters.AddWithValue("@whsCode", consulta.Almacen);
            _connectionDamasco.Open();
            adapter.Fill(dataTable);
            
            foreach (DataRow item in dataTable.Rows)
            {
                var precio = 0.0;
                var ProductSku = Convert.ToString(item["Sku"]);
                var ProductSkuPriceSQl = new SqlCommand("select Price from ITM1 where ItemCode = @itemCode", _connectionDamasco);
                ProductSkuPriceSQl.Parameters.AddWithValue("@itemCode", ProductSku);
                using (var reader = ProductSkuPriceSQl.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        precio = Convert.ToDouble(reader["Price"]);
                    }
                }
             
                    seriales.Add(new SerialesModel
                {
                    SerialNumber = Convert.ToString(item["SerialSku"]),
                    DateSerial = Convert.ToDateTime(item["FechaMov"]),
                    ProductSku = Convert.ToString(item["Sku"]),
                    ProductName = Convert.ToString(item["Descrip"]),
                    NumberMovement = Convert.ToInt32(item["LineNum"]),
                    PriceSku = precio,
                    WarehouseId = Convert.ToString(item["WhsCode"]),
                    WarehouseName = Convert.ToString(item["Sucursal"]),
                    TypeMovement = Convert.ToString(item["TipoDeDocumento"])
                });
            }
            _connectionDamasco.Close();
            return Ok(seriales);
        }
        //consulto por sku y almacen
        [HttpPost("sku-almacen")]
        public IActionResult ConsultaSerialesConSkuEspecificoAlmacen(ConsultaModel consulta)
        {
            List<SerialesModel> seriales = new List<SerialesModel>();
            connection();
            //GetSerialesMovimientoSkuAndProductAndWarehouse
            SqlCommand command = new SqlCommand("GetSerialesMovimientoSkuAndWarehouse", _connectionDamasco);
            System.Data.DataTable dataTable = new System.Data.DataTable();
            command.CommandType = System.Data.CommandType.StoredProcedure;
            SqlDataAdapter adapter = new SqlDataAdapter(command);
            command.Parameters.AddWithValue("@SkuProd", consulta.Sku);
           
            command.Parameters.AddWithValue("@whsCode", consulta.Almacen);
            command.CommandTimeout = 3600;
            
            _connectionDamasco.Open();
            adapter.Fill(dataTable);
           
            foreach (DataRow item in dataTable.Rows)
            {
                var precio = 0.0;
                var ProductSku = Convert.ToString(item["Sku"]);
                var ProductSkuPriceSQl = new SqlCommand("select Price from ITM1 where ItemCode = @itemCode", _connectionDamasco);
                ProductSkuPriceSQl.Parameters.AddWithValue("@itemCode", ProductSku);
                using (var reader = ProductSkuPriceSQl.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        precio = Convert.ToDouble(reader["Price"]);
                    }
                }
                seriales.Add(new SerialesModel
                {
                    SerialNumber = Convert.ToString(item["SerialSku"]),
                    DateSerial = Convert.ToDateTime(item["FechaMov"]),
                    ProductSku = Convert.ToString(item["Sku"]),
                    ProductName = Convert.ToString(item["Descrip"]),
                    NumberMovement = Convert.ToInt32(item["LineNum"]),
                    PriceSku = precio,
                    WarehouseId = Convert.ToString(item["WhsCode"]),
                    WarehouseName = Convert.ToString(item["Sucursal"]),
                    TypeMovement = Convert.ToString(item["TipoDeDocumento"])
                });
                
            }
            _connectionDamasco.Close();
            return Ok(seriales);
        }

        [HttpPost("serial-almacen")]
        public IActionResult ConsultaSerialesConSerialAndAlmacen(ConsultaModel consulta)
        {
            List<SerialesModel> seriales = new List<SerialesModel>();
            connection();
            SqlCommand command = new SqlCommand("GetSerialesMovimientoSerialAndAlmacen", _connectionDamasco);
            System.Data.DataTable dataTable = new System.Data.DataTable();
            SqlDataAdapter adapter = new SqlDataAdapter(command);
            command.CommandType = System.Data.CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@whsCode", consulta.Almacen);
            command.Parameters.AddWithValue("@serialId", consulta.Serial);
            _connectionDamasco.Open();
            adapter.Fill(dataTable);
           
            foreach (DataRow item in dataTable.Rows)
            {
                var precio = 0.0;
                var ProductSku = Convert.ToString(item["Sku"]);
                var ProductSkuPriceSQl = new SqlCommand("select Price from ITM1 where ItemCode = @itemCode", _connectionDamasco);
                ProductSkuPriceSQl.Parameters.AddWithValue("@itemCode", ProductSku);
                using (var reader = ProductSkuPriceSQl.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        precio = Convert.ToDouble(reader["Price"]);
                    }
                }
                seriales.Add(new SerialesModel
                {
                    SerialNumber = Convert.ToString(item["SerialSku"]),
                    DateSerial = Convert.ToDateTime(item["FechaMov"]),
                    ProductSku = Convert.ToString(item["Sku"]),
                    ProductName = Convert.ToString(item["Descrip"]),
                    NumberMovement = Convert.ToInt32(item["LineNum"]),
                    PriceSku = precio,
                    WarehouseId = Convert.ToString(item["WhsCode"]),
                    WarehouseName = Convert.ToString(item["Sucursal"]),
                    TypeMovement = Convert.ToString(item["TipoDeDocumento"])
                });
            }
            return Ok(seriales);
            _connectionDamasco.Close();
        }

        //consulto por serial y almacen




        [HttpPost("seriales-disponibles")]
        public IActionResult ConsultaSerialesDisponibles(ConsultaModel consulta)
        {
            List<AvailableSerialModel> serialesDisponibles = new List<AvailableSerialModel>();
            connection();
            var ProductAvailableSerialQuery =  new SqlCommand("Select Distinct(OSRN.ItemCode),  OSRN.itemName,OSRN.DistNumber, OSRQ.WhsCode, OSRQ.Quantity ,WhsName From OSRN inner join OSRQ " +
                "On OSRN.ItemCode = OSRQ.ItemCode And OSRN.SysNumber = OSRQ.SysNumber Inner Join OWHS on " +
                "OWHS.WhsCode = OSRQ.WhsCode where OSRQ.WhsCode=@whsCode   " +
                "and osrq.ItemCode=@SkuProd  AND OSRQ.Quantity!='0' " +
                "Order By OSRN.ItemCode", _connectionDamasco);
            ProductAvailableSerialQuery.Parameters.AddWithValue("@SkuProd", consulta.Sku);
            ProductAvailableSerialQuery.Parameters.AddWithValue("@whsCode", consulta.Almacen);
            System.Data.DataTable dataTable = new System.Data.DataTable();
            SqlDataAdapter adapter = new SqlDataAdapter(ProductAvailableSerialQuery);
            _connectionDamasco.Open();
            adapter.Fill(dataTable);
            foreach (DataRow item in dataTable.Rows)
            {

                serialesDisponibles.Add(new AvailableSerialModel
                {
                    ItemCode = Convert.ToString(item["ItemCode"]),
                    ItemName = Convert.ToString(item["itemName"]),
                    WarehouseCode = Convert.ToString(item["WhsCode"]),
                    WarehouseName = Convert.ToString(item["WhsName"]),
                    SerialNumber = Convert.ToString(item["DistNumber"]),
                    QuantityProduct = Convert.ToInt32(item["Quantity"])
                    

                });
            
            
            }
            return Ok(serialesDisponibles);
            }
    }

  
}
