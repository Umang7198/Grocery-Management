package com.GroceryManagementSystem.GroceryShop.repository;


import com.GroceryManagementSystem.GroceryShop.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {

}
