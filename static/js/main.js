// Main JavaScript for Beneficiary Management System

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeModals();
    initializeConfirmations();
    initializeFormValidation();
    initializeSearch();
    initializeDatePickers();
    initializeTooltips();
});

// Modal Management
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const modalCloses = document.querySelectorAll('.modal .close, [data-modal-close]');

    // Open modals
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const targetModal = document.querySelector(trigger.dataset.modalTarget);
            if (targetModal) {
                openModal(targetModal);
                
                // Populate form if editing
                if (trigger.dataset.recordId) {
                    populateEditForm(trigger.dataset.recordId);
                }
            }
        });
    });

    // Close modals
    modalCloses.forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = closeBtn.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    // Close modal when clicking outside
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="block"]');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });
}

function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form if exists
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
        clearValidationErrors(form);
    }
}

// Populate edit form with record data
function populateEditForm(recordId) {
    // This would typically fetch data via AJAX
    // For now, we'll extract data from the table row
    const row = document.querySelector(`tr[data-record-id="${recordId}"]`);
    if (!row) return;

    const cells = row.querySelectorAll('td');
    const form = document.querySelector('#editBeneficiaryForm');
    if (!form) return;

    // Map table data to form fields
    // This is a simplified version - in practice you'd have structured data
    const formData = {
        'first_name': cells[1]?.textContent.split(' ')[0] || '',
        'id_passport_number': cells[2]?.textContent || '',
        'phone_number': cells[4]?.textContent || '',
        'status': cells[6]?.textContent.trim() || ''
    };

    // Populate form fields
    Object.keys(formData).forEach(key => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field) {
            field.value = formData[key];
        }
    });

    // Set the form action to include record ID
    form.action = `/edit_beneficiary/${recordId}`;
}

// Confirmation dialogs
function initializeConfirmations() {
    const deleteButtons = document.querySelectorAll('.delete-btn, [data-confirm]');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const message = button.dataset.confirm || 'هل أنت متأكد من هذا الإجراء؟';
            if (!confirm(message)) {
                e.preventDefault();
                return false;
            }
        });
    });
}

// Form Validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(form)) {
                e.preventDefault();
            }
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(input);
            });
        });
    });
}

function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    clearValidationErrors(form);

    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    // Custom validations
    const idPassportField = form.querySelector('[name="id_passport_number"]');
    if (idPassportField && idPassportField.value) {
        if (idPassportField.value.length < 8) {
            showFieldError(idPassportField, 'رقم الهوية يجب أن يكون على الأقل 8 أرقام');
            isValid = false;
        }
    }

    const phoneField = form.querySelector('[name="phone_number"]');
    if (phoneField && phoneField.value) {
        const phoneRegex = /^05\d{8}$/;
        if (!phoneRegex.test(phoneField.value)) {
            showFieldError(phoneField, 'رقم الهاتف يجب أن يبدأ بـ 05 ويحتوي على 10 أرقام');
            isValid = false;
        }
    }

    const dateField = form.querySelector('[name="date_of_birth"]');
    if (dateField && dateField.value) {
        const birthDate = new Date(dateField.value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 0 || age > 120) {
            showFieldError(dateField, 'تاريخ الميلاد غير صحيح');
            isValid = false;
        }
    }

    return isValid;
}

function validateField(field) {
    if (field.required && !field.value.trim()) {
        showFieldError(field, 'هذا الحقل مطلوب');
        return false;
    }

    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = 'var(--danger)';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '5px';
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function clearValidationErrors(form) {
    const errorElements = form.querySelectorAll('.field-error');
    errorElements.forEach(error => error.remove());
    
    const errorFields = form.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
}

// Search functionality
function initializeSearch() {
    const searchInputs = document.querySelectorAll('.search-input');
    
    searchInputs.forEach(input => {
        let searchTimeout;
        
        input.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (input.value.length >= 2) {
                    showSearchSuggestions(input);
                } else {
                    hideSearchSuggestions(input);
                }
            }, 300);
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!input.contains(e.target)) {
                hideSearchSuggestions(input);
            }
        });
    });
}

function showSearchSuggestions(input) {
    const query = input.value;
    
    fetch(`/api/search_suggestions?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(suggestions => {
            displaySuggestions(input, suggestions);
        })
        .catch(error => {
            console.error('Search error:', error);
        });
}

function displaySuggestions(input, suggestions) {
    hideSearchSuggestions(input);
    
    if (suggestions.length === 0) return;
    
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'search-suggestions';
    suggestionsDiv.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 0 0 6px 6px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        max-height: 200px;
        overflow-y: auto;
    `;
    
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.style.cssText = `
            padding: 10px 15px;
            cursor: pointer;
            border-bottom: 1px solid #f1f5f9;
        `;
        item.innerHTML = `
            <div style="font-weight: 600;">${suggestion.name}</div>
            <div style="font-size: 0.8rem; color: var(--gray);">
                ${suggestion.id_passport} • ${suggestion.phone}
            </div>
        `;
        
        item.addEventListener('click', function() {
            input.value = suggestion.name;
            hideSearchSuggestions(input);
            
            // Trigger search
            const form = input.closest('form');
            if (form) {
                form.submit();
            }
        });
        
        item.addEventListener('mouseenter', function() {
            item.style.backgroundColor = '#f8fafc';
        });
        
        item.addEventListener('mouseleave', function() {
            item.style.backgroundColor = 'white';
        });
        
        suggestionsDiv.appendChild(item);
    });
    
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(suggestionsDiv);
}

function hideSearchSuggestions(input) {
    const existing = input.parentNode.querySelector('.search-suggestions');
    if (existing) {
        existing.remove();
    }
}

// Date picker initialization
function initializeDatePickers() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    
    dateInputs.forEach(input => {
        // Set max date to today for birth dates
        if (input.name === 'date_of_birth') {
            const today = new Date().toISOString().split('T')[0];
            input.max = today;
        }
        
        // Set default date format and locale
        input.addEventListener('focus', function() {
            this.showPicker?.();
        });
    });
}

// Tooltip initialization
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            showTooltip(element);
        });
        
        element.addEventListener('mouseleave', function() {
            hideTooltip(element);
        });
    });
}

function showTooltip(element) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = element.dataset.tooltip;
    tooltip.style.cssText = `
        position: absolute;
        background: var(--dark);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 0.8rem;
        z-index: 2000;
        pointer-events: none;
        white-space: nowrap;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
    tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
    
    element._tooltip = tooltip;
}

function hideTooltip(element) {
    if (element._tooltip) {
        element._tooltip.remove();
        delete element._tooltip;
    }
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}

function formatPhoneNumber(phone) {
    if (!phone) return '';
    
    // Format as: 050 123 4567
    if (phone.length === 10) {
        return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    
    return phone;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        showNotification('تم نسخ النص', 'success');
    }).catch(function() {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('تم نسخ النص', 'success');
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: 'var(--primary)',
        error: 'var(--danger)',
        warning: 'var(--warning)',
        info: 'var(--info)'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Export functions for use in templates
window.BeneficiarySystem = {
    openModal,
    closeModal,
    showNotification,
    copyToClipboard,
    formatDate,
    formatPhoneNumber
};
