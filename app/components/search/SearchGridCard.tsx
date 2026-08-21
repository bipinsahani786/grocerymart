import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../data/groceryData';
import { useCart } from '../../context/CartContext';
import { resolveImageUrl } from '../../utils/image';
import tw from 'twrnc';

interface SearchGridCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

/**
 * 4-Per-Row Direct Grid Card (174px height, subtle rounded-md corners, instant ADD stepper)
 */
export const SearchGridCard: React.FC<SearchGridCardProps> = ({ product, onPress }) => {
  const { cart = [], addToCart, removeFromCart } = useCart();
  const cartItem = cart?.find((i) => i.id === product?.id);
  const qty = cartItem?.quantity || 0;
  const imageSource = resolveImageUrl(product?.imageUrls?.[0] || product?.image || product?.imageUrl);

  const sellingPrice = Number(product?.price) || 0;
  const mrp = Number(product?.originalPrice) || Math.round(sellingPrice * 1.25);
  const discountPercent = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  return (
    <View
      style={[
        tw`w-full bg-white rounded-md border border-slate-200/90 p-1.5 justify-between shadow-sm`,
        { height: 174 },
      ]}
    >
      <TouchableOpacity
        onPress={() => onPress(product)}
        activeOpacity={0.85}
        style={tw`w-full flex-1 justify-between`}
      >
        {/* Square Image Box */}
        <View style={tw`h-18 w-full rounded-sm bg-slate-50 border border-slate-100 items-center justify-center relative overflow-hidden mb-1`}>
          {discountPercent > 0 && (
            <View style={tw`absolute top-0.5 left-0.5 bg-blue-600 px-1 py-0.2 rounded-sm z-10 shadow-sm`}>
              <Text style={tw`text-[6.5px] font-black text-white`}>{discountPercent}%</Text>
            </View>
          )}

          {imageSource ? (
            <Image
              source={{ uri: imageSource }}
              style={tw`w-full h-full p-1`}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="basket-outline" size={18} color="#94A3B8" />
          )}
        </View>

        {/* Product Meta */}
        <View>
          <Text style={tw`text-[7.5px] font-bold text-slate-400`} numberOfLines={1}>
            {product?.weight || product?.unit || '1 unit'}
          </Text>

          <View style={{ height: 24, justifyContent: 'flex-start', marginTop: 1 }}>
            <Text style={tw`text-[9px] font-black text-slate-800 leading-3`} numberOfLines={2}>
              {product?.name || 'Product'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Price & Action Row */}
      <View style={tw`w-full mt-auto pt-1 border-t border-slate-100`}>
        <View style={tw`flex-row justify-between items-center mb-1`}>
          <Text style={tw`text-[10.5px] font-black text-slate-900`}>
            ₹{sellingPrice.toFixed(0)}
          </Text>
          {mrp > sellingPrice && (
            <Text style={tw`text-[8px] line-through font-bold text-slate-400`}>
              ₹{mrp.toFixed(0)}
            </Text>
          )}
        </View>

        {qty > 0 ? (
          <View style={tw`w-full flex-row items-center justify-between bg-emerald-700 rounded-sm px-1 py-0.8 shadow-sm`}>
            <TouchableOpacity onPress={() => removeFromCart(product.id)} style={tw`p-0.2`}>
              <Ionicons name="remove" size={9} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={tw`text-[9px] font-black text-white px-0.5`}>{qty}</Text>
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
              style={tw`p-0.2`}
            >
              <Ionicons name="add" size={9} color="#FFFFFF" />
            </TouchableOpacity>
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
            style={tw`w-full py-0.8 rounded-sm bg-emerald-50 border border-emerald-600 items-center justify-center flex-row gap-0.5`}
          >
            <Text style={tw`text-[8.5px] font-black text-emerald-800 uppercase`}>ADD</Text>
            <Ionicons name="add" size={10} color="#059669" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
