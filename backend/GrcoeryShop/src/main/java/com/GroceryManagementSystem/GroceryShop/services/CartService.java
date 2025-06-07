package com.GroceryManagementSystem.GroceryShop.services;

import com.GroceryManagementSystem.GroceryShop.model.Cart;
import com.GroceryManagementSystem.GroceryShop.repository.OrderRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {

    private final OrderRepo orderRepo;

    CartService(OrderRepo orderRepo){
        this.orderRepo = orderRepo;
    }

    public void addOrder(Cart order) {
        orderRepo.save(order);
    }

    public List<Cart> getOrders() {
        return orderRepo.findAll();
    }

    public Cart updateQuantityById(Cart cartProduct) {
        return orderRepo.save(cartProduct);
    }
}
