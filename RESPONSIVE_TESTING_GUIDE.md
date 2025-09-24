# Panduan Testing Responsive Dialog & Info Panel

## Overview
Sistem dialog dan info panel telah diupdate untuk responsif di semua device. Berikut panduan testing untuk memastikan fitur bekerja dengan baik.

## Fitur yang Telah Diupdate

### ✅ Dialog System
- **Auto sizing**: Dialog menyesuaikan ukuran berdasarkan screen size
- **Dynamic positioning**: Posisi dialog berubah sesuai layar
- **Responsive fonts**: Font size menyesuaikan dengan device
- **Smart toggle button**: Button positioning mengikuti dialog

### ✅ Info Panel (Food Information)
- **Mobile optimization**: Panel lebih kecil di mobile
- **Responsive text**: Font size dan line height adaptif
- **Better spacing**: Padding dan margin disesuaikan

### ✅ Responsive Breakpoints
- **xs**: < 480px - Mobile portrait
- **sm**: 480-640px - Mobile landscape / small tablet
- **md**: 640-768px - Tablet portrait
- **lg**: 768-1024px - Tablet landscape / small desktop
- **xl**: > 1024px - Desktop

## Testing Checklist

### 1. Desktop Testing (> 1024px)
- [ ] Dialog width: ~700px
- [ ] Dialog height: ~140px (expanded), ~40px (collapsed)
- [ ] Font size: 16px (content), 14px (step indicator)
- [ ] Info panel width: 400px
- [ ] Toggle button: 62px size

### 2. Tablet Testing (768-1024px)
- [ ] Dialog width: ~600px
- [ ] Dialog height: ~120px (expanded), ~35px (collapsed)
- [ ] Font size: 14px (content), 12px (step indicator)
- [ ] Info panel width: 375px
- [ ] Toggle button: 62px size

### 3. Mobile Landscape Testing (640-768px)
- [ ] Dialog width: ~400px
- [ ] Dialog height: ~120px * 0.8 = ~96px (expanded)
- [ ] Font size: 13px (content)
- [ ] Info panel: Reduced size for landscape
- [ ] Toggle button: 62px size

### 4. Mobile Portrait Testing (480-640px)
- [ ] Dialog width: ~320px
- [ ] Dialog height: ~110px (expanded), ~28px (collapsed)
- [ ] Font size: 12px (content), 10px (step indicator)
- [ ] Info panel width: 160px
- [ ] Toggle button: 40px size

### 5. Small Mobile Testing (< 480px)
- [ ] Dialog width: ~280px
- [ ] Dialog height: ~100px (expanded), ~25px (collapsed)
- [ ] Font size: 11px (content), 9px (step indicator)
- [ ] Info panel width: 140px
- [ ] Toggle button: 40px size

## Testing Steps

### A. Browser Developer Tools Testing
1. Open browser Developer Tools (F12)
2. Enable Device Toolbar (Ctrl+Shift+M)
3. Test different device presets:
   - iPhone SE (375x667)
   - iPhone 12 Pro (390x844)
   - iPad (768x1024)
   - iPad Pro (1024x1366)
   - Desktop (1920x1080)

### B. Responsive Resize Testing
1. Manually resize browser window
2. Check dialog adapts smoothly
3. Verify no overlapping elements
4. Test both portrait and landscape orientations

### C. Real Device Testing
1. Test pada smartphone Android
2. Test pada iPhone
3. Test pada tablet
4. Test rotasi landscape/portrait

## Expected Behavior

### Dialog System
- **Collapse state**: Shows scene title + step counter with minimal space
- **Expand state**: Shows full dialog with step text and progress bar
- **Position**: Always centered horizontally, positioned from top
- **Toggle button**: Always appears below dialog, proper size for device

### Info Panel
- **Mobile**: Smaller width, compact items, smaller fonts
- **Desktop**: Full size panel with large readable text
- **Content**: Title and description adapt to screen size
- **Scrolling**: Content scrollable if too long for container

### Performance
- **Smooth transitions**: All size changes should be smooth
- **No jumping**: Elements should not jump during resize
- **Fast loading**: Responsive calculations should be instant

## Common Issues & Solutions

### Issue: Dialog too large on mobile
**Check**: Hook configuration in `useResponsiveDialog.ts`
**Solution**: Adjust breakpoint values for mobile sizes

### Issue: Text too small to read
**Check**: Font size calculations in responsive config
**Solution**: Increase minimum font sizes in hook

### Issue: Dialog overlaps with game elements
**Check**: Z-index values and positioning
**Solution**: Adjust positioning calculations

### Issue: Toggle button in wrong position
**Check**: Button positioning calculation
**Solution**: Verify responsive dialog height + offset calculation

## Browser Compatibility

### Tested Browsers
- [x] Chrome (latest)
- [ ] Firefox (latest) - **Needs testing**
- [ ] Safari (latest) - **Needs testing**
- [ ] Edge (latest) - **Needs testing**

### Mobile Browsers
- [ ] Chrome Mobile - **Needs testing**
- [ ] Safari iOS - **Needs testing**
- [ ] Samsung Internet - **Needs testing**

## Performance Testing

### Metrics to Check
- [ ] Resize event handling performance
- [ ] Memory usage during orientation changes
- [ ] Smooth animations during size changes
- [ ] No layout thrashing

## Files Modified

### New Files
- `src/hooks/useResponsiveDialog.ts` - Main responsive logic
- `RESPONSIVE_TESTING_GUIDE.md` - This testing guide

### Modified Files
- `src/components/KitchenBackgroundWrapper.tsx` - Dialog and info panel responsive integration

## Test Results Template

```
Device: [Device name]
Screen Size: [width x height]
Orientation: [Portrait/Landscape]

Dialog:
- Width: ___px (Expected: ___px)
- Height Expanded: ___px (Expected: ___px)
- Height Collapsed: ___px (Expected: ___px)
- Font Size: ___px (Expected: ___px)
- Position: OK / Issues: ___

Info Panel:
- Width: ___px (Expected: ___px)
- Font Size: ___px (Expected: ___px)
- Readability: Good / Fair / Poor
- Issues: ___

Toggle Button:
- Size: ___px (Expected: ___px)
- Position: OK / Issues: ___

Overall: PASS / FAIL
Notes: ___
```

## Next Actions

1. **Complete real device testing**
2. **Test in all major browsers**
3. **Performance optimization if needed**
4. **Fine-tune breakpoints based on test results**
5. **Document any discovered edge cases**