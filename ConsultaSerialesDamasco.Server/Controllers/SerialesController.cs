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
        
            SqlCommand command = new SqlCommand("select WhsCode,WhsName from OWHS where WhsName NOT LIKE '%(Inactivo)%'",_connectionDamasco);
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

        [HttpPost("seriales-sku")]
        public IActionResult ConsultaSerialesSKu(ConsultaModel consulta) {
            List<SerialesModel> seriales = new List<SerialesModel>();
            connection();
            
            SqlCommand command = new SqlCommand("GetSerialesMovimientoSku", _connectionDamasco);
            command.CommandType = System.Data.CommandType.StoredProcedure;
            SqlDataAdapter adapter = new SqlDataAdapter(command);
            command.Parameters.AddWithValue("@SkuProd", consulta.Sku);
            System.Data.DataTable dataTable = new System.Data.DataTable();
            _connectionDamasco.Open();
            adapter.Fill(dataTable);
            _connectionDamasco.Close();
            foreach (DataRow item in dataTable.Rows) 
            {
                seriales.Add(new SerialesModel {
                SerialNumber = Convert.ToString(item["SerialSku"]),
                DateSerial = Convert.ToDateTime(item["FechaMov"]),
                ProductSku = Convert.ToString(item["Sku"]),
                ProductName = Convert.ToString(item["Descrip"]),
                NumberMovement = Convert.ToInt32(item["LineNum"]),
                WarehouseId = Convert.ToString(item["WhsCode"]),
                WarehouseName = Convert.ToString(item["Sucursal"]),
                TypeMovement = Convert.ToString(item["TipoDeDocumento"])
               });
            }
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
            _connectionDamasco.Open();
            adapter.Fill(dataTable);
            _connectionDamasco.Close();
            foreach (DataRow item in dataTable.Rows)
            {
                seriales.Add(new SerialesModel
                {
                    SerialNumber = Convert.ToString(item["SerialSku"]),
                    DateSerial = Convert.ToDateTime(item["FechaMov"]),
                    ProductSku = Convert.ToString(item["Sku"]),
                    ProductName = Convert.ToString(item["Descrip"]),
                    NumberMovement = Convert.ToInt32(item["LineNum"]),
                    WarehouseId = Convert.ToString(item["WhsCode"]),
                    WarehouseName = Convert.ToString(item["Sucursal"]),
                    TypeMovement = Convert.ToString(item["TipoDeDocumento"])
                });
            }
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
            _connectionDamasco.Close();
            foreach (DataRow item in dataTable.Rows)
            {
                seriales.Add(new SerialesModel
                {
                    SerialNumber = Convert.ToString(item["SerialSku"]),
                    DateSerial = Convert.ToDateTime(item["FechaMov"]),
                    ProductSku = Convert.ToString(item["Sku"]),
                    ProductName = Convert.ToString(item["Descrip"]),
                    NumberMovement = Convert.ToInt32(item["LineNum"]),
                    WarehouseId = Convert.ToString(item["WhsCode"]),
                    WarehouseName = Convert.ToString(item["Sucursal"]),
                    TypeMovement = Convert.ToString(item["TipoDeDocumento"])
                });
            }
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
            _connectionDamasco.Open();
            adapter.Fill(dataTable);
            _connectionDamasco.Close();
            foreach (DataRow item in dataTable.Rows)
            {
                seriales.Add(new SerialesModel
                {
                    SerialNumber = Convert.ToString(item["SerialSku"]),
                    DateSerial = Convert.ToDateTime(item["FechaMov"]),
                    ProductSku = Convert.ToString(item["Sku"]),
                    ProductName = Convert.ToString(item["Descrip"]),
                    NumberMovement = Convert.ToInt32(item["LineNum"]),
                    WarehouseId = Convert.ToString(item["WhsCode"]),
                    WarehouseName = Convert.ToString(item["Sucursal"]),
                    TypeMovement = Convert.ToString(item["TipoDeDocumento"])
                });
            }
            return Ok(seriales);
        }






    }
}
