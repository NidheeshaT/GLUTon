#include <iostream>
#include <fstream>
#include <GL/glut.h>
#include <FreeImage.h>

void saveTextureToFile(GLuint textureID, int width, int height, const std::string& filename)
{
    glBindTexture(GL_TEXTURE_2D, textureID);

    BYTE* pixels = new BYTE[3 * width * height];
    glGetTexImage(GL_TEXTURE_2D, 0, GL_RGB, GL_UNSIGNED_BYTE, pixels);

    for(int i=0;i<3*width*height;i+=3)
    {
        BYTE temp=pixels[i];
        pixels[i]=pixels[i+2];
        pixels[i+2]=temp;
    }

    FIBITMAP* image = FreeImage_ConvertFromRawBits(pixels, width, height, 3 * width, 24, 0xFF0000, 0x00FF00, 0x0000FF, false);
    FreeImage_Save(FIF_PNG, image, filename.c_str(), 0);
    FreeImage_Unload(image);

    delete[] pixels;
}

void display()
{
    // Your GLUT drawing code here
    // ...

    glClearColor(0.0, 0.0, 0.0, 1.0);
    glClear(GL_COLOR_BUFFER_BIT);
    glBegin(GL_POLYGON);
    glColor3f(0.0, 1.0, 1.0);
    glVertex2f(0.0, 0.0);
    glVertex2f(0.0, 1.0);
    glVertex2f(1.0, 0.0);
    glEnd();
    // glFlush();

    // Save the GLUT drawings to an image file
    int windowWidth = glutGet(GLUT_WINDOW_WIDTH);
    int windowHeight = glutGet(GLUT_WINDOW_HEIGHT);
    GLuint textureID = 0;

    glGenTextures(1, &textureID);
    glBindTexture(GL_TEXTURE_2D, textureID);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, windowWidth, windowHeight, 0, GL_RGB, GL_UNSIGNED_BYTE, NULL);
    glCopyTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, 0, 0, windowWidth, windowHeight);
    saveTextureToFile(textureID, windowWidth, windowHeight, "glut_output.png");

    // Cleanup
    glDeleteTextures(1, &textureID);

    // Exit the program after saving the GLUT drawings
    exit(0);
}

int main(int argc, char** argv)
{
    // Initialize GLUT
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_RGB | GLUT_SINGLE);
    glutInitWindowSize(800, 600);
    glutCreateWindow("GLUT to File");
    display();
    // Set the display callback function
    glutDisplayFunc(display);

    // Enter the GLUT event loop
    glutMainLoop();

    return 0;
}
//apt update
//apt-get install gcc g++ 
//apt install freeglut3-dev libfreeimage-dev
//apt-get install xvfb
//
//g++ main.cpp -lglut -lGL -lGLU -lfreeimage -lstdc++
//g++ -I./include -L./lib main.cpp -lfreeglut -lglu32 -lopengl32 -lFreeImage -o main
//xvfb-run ./a.out