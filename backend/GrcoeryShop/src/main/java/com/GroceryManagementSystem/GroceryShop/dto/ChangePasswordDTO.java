package com.GroceryManagementSystem.GroceryShop.dto;


public class ChangePasswordDTO {
        private Long id;
        private String oldPassword;
        private String newPassword;

        public ChangePasswordDTO(Long id, String oldPassword, String newPassword) {
                this.id = id;
                this.oldPassword = oldPassword;
                this.newPassword = newPassword;
        }

        public String getOldPassword() {
                return oldPassword;
        }

        public void setOldPassword(String oldPassword) {
                this.oldPassword = oldPassword;
        }

        public Long getId() {
                return id;
        }

        public void setId(Long id) {
                this.id = id;
        }

        public String getNewPassword() {
                return newPassword;
        }

        public void setNewPassword(String newPassword) {
                this.newPassword = newPassword;
        }
}
