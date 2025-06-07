package com.GroceryManagementSystem.GroceryShop.repository;

import com.GroceryManagementSystem.GroceryShop.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepo extends JpaRepository<Cart, Long> {

}
