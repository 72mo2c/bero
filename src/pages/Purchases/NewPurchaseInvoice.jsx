// ======================================
// New Purchase Invoice - فاتورة مشتريات جديدة (محسّنة)
// ======================================

import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { FaSave, FaPrint, FaSearch, FaTrash } from 'react-icons/fa';
import { printInvoiceDirectly } from '../../utils/printUtils';

const NewPurchaseInvoice = () => {
  const { suppliers, products, warehouses, addPurchaseInvoice } = useData();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    supplierId: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    paymentType: 'main',
    notes: ''
  });

  const [items, setItems] = useState([{
    productId: '',
    productName: '',
    quantity: 1,
    subQuantity: 0,
    price: 0,
    subPrice: 0
  }]);

  // البحث في الموردين والمنتجات
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const [productSearches, setProductSearches] = useState(['']);
  const [showProductSuggestions, setShowProductSuggestions] = useState([false]);
  
  // حالات الخطأ
  const [supplierError, setSupplierError] = useState(false);
  const [productErrors, setProductErrors] = useState([false]);
  const [quantityErrors, setQuantityErrors] = useState([false]);
  const [priceErrors, setPriceErrors] = useState([false]);
  const [validationErrors, setValidationErrors] = useState({});

  // مراجع للتركيز التلقائي
  const supplierInputRef = useRef(null);
  const productInputRefs = useRef([]);
  const quantityInputRefs = useRef([]);

  // التركيز التلقائي عند التحميل
  useEffect(() => {
    supplierInputRef.current?.focus();
  }, []);

  // معالجة اختصارات الكيبورد
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S للحفظ
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSubmit(e);
      }
      // Enter لإضافة صف جديد (عند التركيز في حقل الكمية الأخير)
      if (e.key === 'Enter' && e.target.name?.startsWith('quantity-')) {
        const index = parseInt(e.target.name.split('-')[1]);
        if (index === items.length - 1) {
          e.preventDefault();
          addItem();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // البحث في الموردين
  const handleSupplierSearch = (value) => {
    setSupplierSearch(value);
    // إظهار القائمة فقط عند وجود نص
    setShowSupplierSuggestions(value.trim().length > 0);
  };

  const selectSupplier = (supplier) => {
    setFormData({ ...formData, supplierId: supplier.id });
    setSupplierSearch(supplier.name);
    setShowSupplierSuggestions(false);
  };
  
  // إخفاء قائمة الموردين عند الخروج من الحقل
  const handleSupplierBlur = () => {
    setTimeout(() => {
      setShowSupplierSuggestions(false);
    }, 200);
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  // البحث في المنتجات
  const handleProductSearch = (index, value) => {
    const newSearches = [...productSearches];
    newSearches[index] = value;
    setProductSearches(newSearches);

    // إظهار القائمة فقط عند وجود نص
    const newShowSuggestions = [...showProductSuggestions];
    newShowSuggestions[index] = value.trim().length > 0;
    setShowProductSuggestions(newShowSuggestions);
  };

  const selectProduct = (index, product) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: product.id,
      productName: product.name,
      price: parseFloat(product.mainPrice) || 0,
      subPrice: parseFloat(product.subPrice) || 0
    };
    setItems(newItems);

    const newSearches = [...productSearches];
    newSearches[index] = product.name;
    setProductSearches(newSearches);

    const newShowSuggestions = [...showProductSuggestions];
    newShowSuggestions[index] = false;
    setShowProductSuggestions(newShowSuggestions);

    // التركيز على حقل الكمية
    setTimeout(() => {
      quantityInputRefs.current[index]?.focus();
    }, 100);
  };
  
  // إخفاء قائمة المنتجات عند الخروج من الحقل
  const handleProductBlur = (index) => {
    setTimeout(() => {
      const newShowSuggestions = [...showProductSuggestions];
      newShowSuggestions[index] = false;
      setShowProductSuggestions(newShowSuggestions);
    }, 200);
  };

  const getFilteredProducts = (index) => {
    const searchTerm = productSearches[index] || '';
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
    
    // التحقق الفوري من الكميات والأسعار
    if (field === 'quantity' || field === 'subQuantity') {
      const newQuantityErrors = [...quantityErrors];
      if (field === 'quantity') {
        newQuantityErrors[index] = value < 0;
      }
      setQuantityErrors(newQuantityErrors);
    }
    
    if (field === 'price' || field === 'subPrice') {
      const newPriceErrors = [...priceErrors];
      if (field === 'price') {
        newPriceErrors[index] = value < 0;
      }
      setPriceErrors(newPriceErrors);
    }
  };

  const addItem = () => {
    setItems([...items, { 
      productId: '', 
      productName: '',
      quantity: 1, 
      subQuantity: 0,
      price: 0,
      subPrice: 0
    }]);
    setProductSearches([...productSearches, '']);
    setShowProductSuggestions([...showProductSuggestions, false]);
    setProductErrors([...productErrors, false]);
    setQuantityErrors([...quantityErrors, false]);
    setPriceErrors([...priceErrors, false]);

    // التركيز على حقل المنتج الجديد
    setTimeout(() => {
      const lastIndex = items.length;
      productInputRefs.current[lastIndex]?.focus();
    }, 100);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
      setProductSearches(productSearches.filter((_, i) => i !== index));
      setShowProductSuggestions(showProductSuggestions.filter((_, i) => i !== index));
      setProductErrors(productErrors.filter((_, i) => i !== index));
      setQuantityErrors(quantityErrors.filter((_, i) => i !== index));
      setPriceErrors(priceErrors.filter((_, i) => i !== index));
    }
  };

  const calculateItemTotal = (item) => {
    const mainTotal = (item.quantity || 0) * (item.price || 0);
    const subTotal = (item.subQuantity || 0) * (item.subPrice || 0);
    return mainTotal + subTotal;
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  // التحقق الشامل من البيانات
  const validateForm = () => {
    const errors = {};
    
    // التحقق من المورد
    if (!formData.supplierId) {
      errors.supplier = 'يجب اختيار المورد';
    }
    
    // التحقق من التاريخ
    if (!formData.date) {
      errors.date = 'يجب إدخال تاريخ الفاتورة';
    }
    
    // التحقق من المنتجات
    const newQuantityErrors = [];
    const newPriceErrors = [];
    
    items.forEach((item, index) => {
      // التحقق من اختيار المنتج
      if (!item.productId) {
        errors[`product_${index}`] = 'يجب اختيار المنتج';
      }
      
      // التحقق من الكمية
      if (item.quantity < 0) {
        errors[`quantity_${index}`] = 'الكمية الأساسية لا يمكن أن تكون سالبة';
        newQuantityErrors[index] = true;
      } else if (item.quantity === 0 && item.subQuantity === 0) {
        errors[`quantity_${index}`] = 'يجب إدخال كمية أساسية أو فرعية';
        newQuantityErrors[index] = true;
      } else {
        newQuantityErrors[index] = false;
      }
      
      // التحقق من السعر
      if (item.price < 0) {
        errors[`price_${index}`] = 'السعر الأساسي لا يمكن أن يكون سالباً';
        newPriceErrors[index] = true;
      } else if (item.price === 0 && item.quantity > 0) {
        errors[`price_${index}`] = 'يجب إدخال سعر أساسي للمنتج';
        newPriceErrors[index] = true;
      } else {
        newPriceErrors[index] = false;
      }
      
      // التحقق من السعر الفرعي
      if (item.subPrice < 0) {
        errors[`subPrice_${index}`] = 'السعر الفرعي لا يمكن أن يكون سالباً';
      } else if (item.subPrice === 0 && item.subQuantity > 0) {
        errors[`subPrice_${index}`] = 'يجب إدخال سعر فرعي عند وجود كمية فرعية';
      }
    });
    
    setQuantityErrors(newQuantityErrors);
    setPriceErrors(newPriceErrors);
    setValidationErrors(errors);
    
    // التحقق من المجموع الكلي
    const total = calculateTotal();
    if (total <= 0) {
      errors.total = 'المجموع الكلي يجب أن يكون أكبر من صفر';
    }
    
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e, shouldPrint = false) => {
    if (e) e.preventDefault();

    // التحقق الشامل من البيانات
    if (!validateForm()) {
      showError('يرجى تصحيح الأخطاء قبل حفظ الفاتورة');
      
      // عرض أول خطأ
      const firstError = Object.values(validationErrors)[0];
      if (firstError) {
        setTimeout(() => showError(firstError), 500);
      }
      return;
    }

    try {
      const invoiceData = {
        ...formData,
        date: `${formData.date}T${formData.time}:00`,
        items,
        total: calculateTotal(),
        status: 'completed'
      };

      const newInvoice = addPurchaseInvoice(invoiceData);
      showSuccess('تم حفظ فاتورة المشتريات بنجاح');

      if (shouldPrint) {
        // الطباعة المباشرة
        const supplier = suppliers.find(s => s.id === parseInt(formData.supplierId));
        printInvoiceDirectly({
          formData: newInvoice,
          items: newInvoice.items,
          total: newInvoice.total,
          supplier,
          suppliers,
          products,
          warehouses
        }, 'purchase');
      }

      resetForm();
    } catch (error) {
      // عرض رسالة الخطأ الفعلية للمستخدم
      showError(error.message || 'حدث خطأ في حفظ الفاتورة');
      console.error('خطأ في حفظ فاتورة المشتريات:', error);
    }
  };
  
  const resetForm = () => {
    setFormData({
      supplierId: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      paymentType: 'main',
      notes: ''
    });
    setItems([{ 
      productId: '', 
      productName: '',
      quantity: 1, 
      subQuantity: 0,
      price: 0,
      subPrice: 0
    }]);
    setSupplierSearch('');
    setProductSearches(['']);
    setShowSupplierSuggestions(false);
    setShowProductSuggestions([false]);
    setSupplierError(false);
    setProductErrors([false]);
    setQuantityErrors([false]);
    setPriceErrors([false]);
    setValidationErrors({});
    supplierInputRef.current?.focus();
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      
      {/* البطاقة الرئيسية */}
      <div className="bg-white rounded-lg shadow-md p-4">
        {/* الصف العلوي: معلومات الفاتورة */}
        <div className="grid grid-cols-4 gap-3 mb-4 pb-4 border-b">
          {/* المورد */}
          <div className="relative">
            <div className="relative">
              <input
                ref={supplierInputRef}
                
                type="text"
                value={supplierSearch}
                onChange={(e) => handleSupplierSearch(e.target.value)}
                onBlur={handleSupplierBlur}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ابحث عن المورد..."
              />
              <FaSearch className="absolute left-2 top-2.5 text-gray-400 text-xs" />
            </div>
            {showSupplierSuggestions && supplierSearch.trim().length > 0 && filteredSuppliers.length > 0 && (
              <div className="absolute z-[9999] w-full mt-1 bg-white border-2 border-blue-400 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                {filteredSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    onClick={() => selectSupplier(supplier)}
                    className="px-4 py-2.5 hover:bg-blue-100 cursor-pointer border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-gray-800">{supplier.name}</span>
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{supplier.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* نوع الفاتورة */}
          <div>
            <select
              name="paymentType"
              value={formData.paymentType}
              onChange={handleChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="main">اختر نوع الفاتورة</option>
              <option value="cash">نقدي</option>
              <option value="deferred">آجل</option>
              <option value="partial">جزئي</option>
            </select>
          </div>

          {/* التاريخ */}
          <div>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* الوقت */}
          <div>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* جدول المنتجات */}
        <div className="mb-4 relative">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-2 py-2 text-right text-xs font-semibold text-gray-700">المنتج</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-20">كمية أساسية</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-20">كمية فرعية</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-24">سعر أساسي</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-24">سعر فرعي</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-24">الإجمالي</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 w-16">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {/* المنتج */}
                  <td className="px-2 py-2 static">
                    <div className="relative z-[10]">
                      <input
                        ref={(el) => (productInputRefs.current[index] = el)}
                        type="text"
                        value={productSearches[index] || ''}
                        onChange={(e) => handleProductSearch(index, e.target.value)}
                        onBlur={() => handleProductBlur(index)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="ابحث عن المنتج..."
                      />
                      <FaSearch className="absolute left-2 top-2.5 text-gray-400 text-xs" />
                    </div>
                    {showProductSuggestions[index] && productSearches[index]?.trim().length > 0 && getFilteredProducts(index).length > 0 && (
                      <div className="absolute z-[9999] left-0 w-full mt-1 bg-white border-2 border-blue-400 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                        {getFilteredProducts(index).map((product) => {
                          const warehouse = warehouses.find(w => w.id === product.warehouseId);
                          return (
                            <div
                              key={product.id}
                              onClick={() => selectProduct(index, product)}
                              className="px-4 py-2.5 hover:bg-blue-100 cursor-pointer border-b last:border-b-0 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  <span className="font-semibold text-sm text-gray-800">{product.name}</span>
                                  <span className="text-xs text-gray-600 mr-2">({warehouse?.name || 'غير محدد'} - {product.category})</span>
                                </div>
                                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">الكمية: {product.mainQuantity || 0}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>

                  {/* الكمية الأساسية */}
                  <td className="px-2 py-2">
                    <input
                      ref={(el) => (quantityInputRefs.current[index] = el)}
                      type="number"
                      name={`quantity-${index}`}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      className={`w-full px-2 py-1.5 text-sm text-center border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        quantityErrors[index] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      min="0"
                    />
                  </td>

                  {/* الكمية الفرعية */}
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={item.subQuantity}
                      onChange={(e) => handleItemChange(index, 'subQuantity', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </td>

                  {/* السعر الأساسي */}
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                      className={`w-full px-2 py-1.5 text-sm text-center border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        priceErrors[index] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      min="0"
                    />
                  </td>

                  {/* السعر الفرعي */}
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={item.subPrice}
                      onChange={(e) => handleItemChange(index, 'subPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-sm text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </td>

                  {/* الإجمالي */}
                  <td className="px-2 py-2 text-center">
                    <span className="font-semibold text-blue-600">
                      {calculateItemTotal(item).toFixed(2)}
                    </span>
                  </td>

                  {/* حذف */}
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* زر إضافة منتج */}
        <button
          type="button"
          onClick={addItem}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors text-sm font-medium"
        >
          + إضافة منتج جديد (Enter)
        </button>

        {/* الجزء السفلي */}
        <div className="mt-4 pt-4 border-t">
          {/* المجموع */}
            <div className=" w-full flex-col justify-center">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300 shadow-md">
                <div className=" justify-between items-center">
                  <span className="text-base font-bold text-gray-700">المجموع الكلي:</span>
                  <span className="text-xl font-bold text-blue-700">{calculateTotal().toFixed(2)} ج.م</span>
                </div>
                <div className="text-xs text-gray-600 mt-2 text-right">
                  عدد المنتجات: {items.length}
                </div>
              </div>
            </div>
          <div className="grid grid-cols-2 gap-4">
            {/* ملاحظات */}
            <div>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل ملاحظات إضافية..."
              />
            </div>
            {/* الأزرار */}
            <div className="flex gap-2">
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            title="إعادة تعيين الفاتورة بالكامل"
          >
            <FaTrash /> إعادة تعيين
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaSave /> حفظ
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaPrint /> حفظ وطباعة
          </button>
        </div>
          </div>
        </div>

        {/* اختصارات الكيبورد */}
        <div className="mt-4 pt-3 border-t text-xs text-gray-500 text-center">
          <span className="inline-block mx-2">💡 اختصارات: </span>
          <span className="inline-block mx-2">Ctrl+S = حفظ</span>
          <span className="inline-block mx-2">Enter = صف جديد</span>
          <span className="inline-block mx-2">Tab = التنقل</span>
        </div>
      </div>
    </div>
  );
};

export default NewPurchaseInvoice;
