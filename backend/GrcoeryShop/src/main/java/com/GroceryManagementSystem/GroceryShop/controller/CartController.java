package com.GroceryManagementSystem.GroceryShop.controller;

import com.GroceryManagementSystem.GroceryShop.model.Cart;
import com.GroceryManagementSystem.GroceryShop.services.CartService;
import com.GroceryManagementSystem.GroceryShop.utils.ResponseApi;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class CartController {

    @Autowired
    private CartService service;

    @PostMapping("/customer/addtocart")
    private ResponseApi<String> addOrder(@RequestBody Cart cart_product) {
        service.addOrder(cart_product);
        return new ResponseApi<>("Order added successfully", true);
    }

    @GetMapping("/customer/getCart")
    private ResponseApi<List<Cart>> getOrders(){
        List<Cart> list= service.getOrders();
        if(list.isEmpty()){
            return new ResponseApi<>("No Order Found", list, true);

        }
        return new ResponseApi<>("Success", list, true);

    }

    @PutMapping("/customer/update/{u_id}")
    public ResponseApi<Cart> updateQuantityById(@PathVariable long u_id, @RequestBody Cart cart_product){
        System.out.println(cart_product);
        Cart updatedCart = service.updateQuantityById(cart_product);
        return new ResponseApi<>("Cart Updated Successfully", updatedCart, true);

    }

}
