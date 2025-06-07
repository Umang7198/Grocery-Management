package com.GroceryManagementSystem.GroceryShop.services;

import com.GroceryManagementSystem.GroceryShop.model.Product;
import com.GroceryManagementSystem.GroceryShop.repository.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductServices {
    @Autowired
    ProductRepo repo;

    public void addProduct( Product product){
        repo.save(product);
    }

    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public Product getProductById(long id) {
        return repo.findById(id).orElse(null);
    }


    public Product updateProductById(long id, Product product) {
        return repo.save(product);
    }

    public void deleteProduct(long id) {
        repo.deleteById(id);
    }
}
