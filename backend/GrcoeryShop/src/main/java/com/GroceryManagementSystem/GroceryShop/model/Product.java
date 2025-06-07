package com.GroceryManagementSystem.GroceryShop.model;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.query.Order;

import java.util.List;

@Entity
@NoArgsConstructor @AllArgsConstructor
@Getter @Setter
@Data
@Table(name = "Products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, length = 25)
    private String name;

    @Column( nullable = false)
    private int quantity;

    private float price;

    private String imgLink;


    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private boolean movedToCart;
}
