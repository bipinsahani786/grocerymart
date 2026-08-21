import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../data/groceryData';
import { useCart } from '../../context/CartContext';
import { useSavedItems } from '../../context/SavedItemsContext';
import { resolveImageUrl } from '../../utils/image';
import tw from 'twrnc';

interface SearchListCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

/**
 * Detailed Horizontal List Card (Fabric-safe: Non-nested Touchables)
 */
export const SearchListCard: React.FC<SearchListCardProps> = ({ product, onPress }) => {
  const { cart = [], addToCart, removeFromCart } = useCart();
  const { isSaved, toggleSaveItem } = useSavedItems();

  const cartItem = cart?.find((item) => item.id === product?.id);
  const qty = cartItem ? cartItem.quantity : 0;
  const itemIsSaved = isSaved ? isSaved(product?.id || '') : false;
  const imageSource = resolveImageUrl(product?.imageUrls?.[0] || product?.image || product?.imageUrl);

  const sellingPrice = Number(product?.price) || 0;
  const mrp = Number(product?.originalPrice) || Math.round(sellingPrice * 1.25);
  const discountPercent = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
  const savings = mrp > sellingPrice ? Math.round(mrp - sellingPrice) : 0;

  return (
    <View style={tw`bg-white rounded-md p-3 border border-slate-200/80 flex-row items-center justify-between shadow-sm`}>
      {/* Left & Middle Tap Area for Product Details */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onPress(product)}
        style={tw`flex-row items-center flex-1 mr-2`}
      >
        {/* Square Thumbnail */}
        <View style={tw`w-20 h-20 rounded-md bg-slate-50 border border-slate-100 relative items-center justify-center overflow-hidden mr-3`}>
          {discountPercent > 0 && (
            <View style={tw`absolute top-1 left-1 bg-blue-600 px-1.5 py-0.2 rounded-sm z-10`}>
              <Text style={tw`text-[7.5px] font-black text-white`}>
                {discountPercent}% OFF
              </Text>
            </View>
          )}

          {imageSource ? (
            <Image
              source={{ uri: imageSource }}
              style={tw`w-full h-full p-1`}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="basket-outline" size={24} color="#94A3B8" />
          )}
        </View>

        {/* Details Column */}
        <View style={tw`flex-1 justify-center`}>
          <View style={tw`flex-row items-center gap-1.5 mb-1`}>
            <View style={tw`flex-row items-center bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-sm`}>
              <Ionicons name="flash" size={8} color="#059669" />
              <Text style={tw`text-[8px] font-black text-emerald-800 ml-0.5`}>10 MINS</Text>
            </View>
            <Text style={tw`text-[9.5px] font-bold text-slate-400`}>
              {product?.weight || product?.unit || '1 unit'}
            </Text>
          </View>

          <Text style={tw`text-[12.5px] font-black text-slate-900 leading-4.2`} numberOfLines={2}>
            {product?.name || 'Product'}
          </Text>

          {/* Price & Savings Row */}
          <View style={tw`flex-row items-center gap-2 mt-1.5`}>
            <Text style={tw`text-[14px] font-black text-slate-900`}>
              ₹{sellingPrice.toFixed(0)}
            </Text>
            {mrp > sellingPrice && (
              <Text style={tw`text-[10px] line-through font-bold text-slate-400`}>
                ₹{mrp.toFixed(0)}
              </Text>
            )}
            {savings > 0 && (
              <View style={tw`bg-emerald-50 px-1.5 py-0.2 rounded-sm border border-emerald-200/60`}>
                <Text style={tw`text-[8px] font-black text-emerald-700`}>Save ₹{savings}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Right: Wishlist & ADD Stepper */}
      <View style={tw`items-end justify-between min-h-[72px]`}>
        <TouchableOpacity
          onPress={() => toggleSaveItem(product)}
          activeOpacity={0.7}
          style={tw`w-6.5 h-6.5 rounded-md bg-slate-50 items-center justify-center border border-slate-100`}
        >
          <Ionicons
            name={itemIsSaved ? 'heart' : 'heart-outline'}
            size={13}
            color={itemIsSaved ? '#E11D48' : '#94A3B8'}
          />
        </TouchableOpacity>

        {qty > 0 ? (
          <View style={tw`flex-row items-center bg-emerald-700 rounded-md px-2 py-1 shadow-sm`}>
            <TouchableOpacity onPress={() => removeFromCart(product.id)} style={tw`px-1.5 py-0.5`}>
              <Ionicons name="remove" size={11} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={tw`text-[11px] font-black text-white px-1.5`}>{qty}</Text>
            <TouchableOpacity
              onPress={() =>
                addToCart({
                  id: product.id,
                  name: product.name || 'Product',
                  price: Number(product.price) || 0,
                  weight: product.weight || '1 unit',
                  image: product.image,
                  imageUrl: product.imageUrl,
                  imageUrls: product.imageUrls,
                })
              }
              style={tw`px-1.5 py-0.5`}
            >
              <Ionicons name="add" size={11} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : product?.outOfStock ? (
          <View style={tw`bg-slate-100 px-2 py-1 rounded-md border border-slate-200`}>
            <Text style={tw`text-[8px] font-bold text-slate-400`}>OUT</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() =>
              addToCart({
                id: product.id,
                name: product.name || 'Product',
                price: Number(product.price) || 0,
                weight: product.weight || '1 unit',
                image: product.image,
                imageUrl: product.imageUrl,
                imageUrls: product.imageUrls,
              })
            }
            activeOpacity={0.85}
            style={tw`px-3 py-1.5 rounded-md border border-emerald-600 bg-emerald-50/80 flex-row items-center gap-1 shadow-sm`}
          >
            <Text style={tw`text-[10px] font-black text-emerald-800 uppercase`}>ADD</Text>
            <Ionicons name="add" size={11} color="#047857" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
