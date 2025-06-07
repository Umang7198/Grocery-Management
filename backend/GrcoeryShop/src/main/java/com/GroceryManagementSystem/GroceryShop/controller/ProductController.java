package com.GroceryManagementSystem.GroceryShop.controller;

import com.GroceryManagementSystem.GroceryShop.model.Product;
import com.GroceryManagementSystem.GroceryShop.services.ProductServices;
import com.GroceryManagementSystem.GroceryShop.utils.ResponseApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class ProductController {
    @Autowired
    private ProductServices service;

    @PostMapping("admin/addProduct")
    public ResponseApi<Product> addProduct(@RequestBody Product product){
        service.addProduct(product);
        return new ResponseApi<>("success", product,true);
    }

    @GetMapping("/getProducts")
    public ResponseApi<List<Product>> getAllProducts(){
        List<Product> list =  service.getAllProducts();
        if(list.isEmpty()){
            return new ResponseApi<>("No Product Found", true);
        }
        else{
            return new ResponseApi<>("Success", list, true);
        }
    }

    @PostMapping("product/{p_id}")
    public ResponseApi<Product> getProductById(@PathVariable long p_id){
        Product product =  service.getProductById(p_id);
        if(product == null){
            return new ResponseApi<>("No Product Found", true);
        }
        else{
            return new ResponseApi<>("Success", product, true);
        }
    }

    @PutMapping("/admin/update/{id}")
    public ResponseApi<Product> updateProductById(@PathVariable long id, @RequestBody Product product){
        Product updateProduct = service.updateProductById(id, product);
        return new ResponseApi<Product>("Success", updateProduct, true);
    }

    @DeleteMapping("/admin/delete/{id}")
    public ResponseApi deleteProduct(@PathVariable long id){
        service.deleteProduct(id);
        return new ResponseApi<Product>("Success", true);
    }

}
