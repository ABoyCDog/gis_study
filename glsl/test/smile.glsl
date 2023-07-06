// 参考资料: https://www.youtube.com/watch?v=GgGBR4z8C9o&list=PLGmrMu-IwbguU_nY2egTFmlg691DN7uE5&index=2&ab_channel=TheArtofCode

// 画圆的函数，参数为 纹理坐标映射、偏移映射、圆半径、边缘模糊程度
float Circle(vec2 uv, vec2 offset, float r, float blur)
{
    // 画圆并平滑处理
    float d = length(uv + offset);
    float c = smoothstep(r, r - blur, d);
    return c;
}

// 绘制一个笑脸，参数为：纹理坐标映射、偏移映射、笑脸缩放
float Smiley(vec2 uv, vec2 offset, float size)
{

    // 位置偏移
    uv += offset;
    // 缩放
    uv /= size;

    // 蒙版（大圆）
    float mask = Circle(uv, vec2(0.f), 0.4f, 0.01f);
    // 减去两个眼眼睛（小圆）
    mask -= Circle(uv, vec2(0.15f, -0.15f), 0.07f, 0.01f);
    mask -= Circle(uv, vec2(-0.15f, -0.15f), 0.07f, 0.01f);

    // 嘴巴，两个圆相减并限制范围
    float mouth = Circle(uv, vec2(0.f), 0.3f, 0.01f);
    mouth = clamp(mouth - Circle(uv, vec2(0.f, -0.12f), 0.4f, 0.01f), 0.f, 1.f);
    
    // 减去嘴巴的区域
    mask = clamp(mask - mouth, 0.f, 1.f);
    
    return mask;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // 计算uv [0, 1]
    vec2 uv = fragCoord/iResolution.xy;
    
    // uv 位置调整 [-0.5, 0.5]
    uv -= 0.5f;
    uv.x *= iResolution.x/iResolution.y;
    
    // 显示的颜色
    vec3 col = vec3(0.5f, 1.f, 1.f);
    
    float mask = 0.f;
    
    mask = Smiley(uv, vec2(0.f, -0.f), 1.2f);

    // 显示最后的图像
    fragColor = vec4(col * mask, 1.f);
}