package com.GroceryManagementSystem.GroceryShop.services;

//import com.GroceryManagementSystem.GrcoeryShop.model.UserDetail;
import com.GroceryManagementSystem.GroceryShop.dto.ChangePasswordDTO;
import com.GroceryManagementSystem.GroceryShop.model.User;
import com.GroceryManagementSystem.GroceryShop.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServices {

    @Autowired
    private UserRepo repo;
    @Autowired
    private JWTService jwtService;
    @Autowired
    private AuthenticationManager authenticationManager;

    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(12);


    public User getUserById(long id) {
        return repo.findById(id).orElse(null);
    }


    public User registerUser(User user) {
        if(repo.existsByEmail(user.getEmail())) {
            return null;
        }else{
            return repo.save(user);
        }

    }


    public User updateDetailsOfUser(User user) {
            return repo.save(user);
    }


    public boolean checkIfIsUserExist(long id) {
        System.out.println("Hello" + id);
        return repo.existsById(id);
    }


    public List<User> getAllUser() {
        return repo.findAll();
    }

    public User getByEmailId(String email){
        return repo.findByEmail(email).orElse(null);
    }


    public String validateUser(User user) {
        System.out.println("Hello from verify user");

        try{
            Authentication authentication = this.authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));
            System.out.println(authentication.isAuthenticated());
            return authentication.isAuthenticated() ? this.jwtService.generateToken(user.getEmail()) : "FAIL";
        }catch (BadCredentialsException e){
            return "INVALID";
        }

    }


    public User updatePassword(ChangePasswordDTO changePasswordDTO) {

        User user = getUserById(changePasswordDTO.getId());
        System.out.println("Hello from" + user.getEmail());
        Authentication authentication = this.authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(), changePasswordDTO.getOldPassword()));

        if(authentication.isAuthenticated()) {
            user.setPassword(this.bCryptPasswordEncoder.encode(changePasswordDTO.getNewPassword()));
            repo.save(user);
            return user;
        }

        return null;

    }
}
