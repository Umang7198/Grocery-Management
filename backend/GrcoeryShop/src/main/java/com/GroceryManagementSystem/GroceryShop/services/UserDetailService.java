package com.GroceryManagementSystem.GroceryShop.services;

import com.GroceryManagementSystem.GroceryShop.model.UserDetail;
import com.GroceryManagementSystem.GroceryShop.model.User;
import com.GroceryManagementSystem.GroceryShop.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailService implements UserDetailsService {

    private UserRepo userRepository;

    @Autowired
    public UserDetailService(UserRepo userRepository) {
        this.userRepository = userRepository;
    }

    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = this.userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return new UserDetail(user);
    }


}
